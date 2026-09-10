import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom';
import { puedeAccederRuta } from '../constants/permissions';
import {
  DEVOLUCIONES_INBOUND_PATH,
  DEVOLUCIONES_QUALITY_PATH,
  DEVOLUCIONES_LEGACY_PATH,
  devolucionesAccessPath
} from '../config/devolucionesRouting';
import { getNavGroups } from '../constants/routeMeta';
import SidebarNavItem from '../components/shell/sidebar/SidebarNavItem';
import { buildRuntimeAccess, runtimeAllowsPath } from '../domain/access/runtimeAccess';
import fs from 'node:fs';

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  from: vi.fn(),
  permissions: new Set(),
  rows: [],
  pending: [],
  queueError: null,
  listError: null
}));
vi.mock('../supabase', () => ({ supabase: { rpc: mocks.rpc, from: mocks.from } }));
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { rol: 'CONTROL_CALIDAD', es_admin_delegado: false },
    hasPermission: (permission) => mocks.permissions.has(permission)
  })
}));
import RecepcionDevoluciones from '../pages/Quality/RecepcionDevoluciones';

const pendingItem = (id = 'item-synthetic') => ({
  devolucion_id: 'return-synthetic',
  devolucion_item_id: id,
  folio: 'DEV-2026-000001',
  cliente: 'CLIENTE PRUEBA R5',
  codigo_producto: 'SKU-R5-TEST',
  descripcion: 'ITEM SINTETICO R5',
  cantidad: 1,
  lote: null,
  serie: null,
  detalle: 'Detalle sintético',
  evidencia: [],
  recibido_en: '2026-09-07T12:00:00Z',
  nv: null,
  guia: null,
  factura: null
});

let client;
beforeEach(() => {
  vi.clearAllMocks();
  mocks.permissions = new Set(['manage_devoluciones', 'inspect_devoluciones']);
  mocks.rows = [];
  mocks.pending = [];
  mocks.queueError = null;
  mocks.listError = null;
  mocks.from.mockImplementation((table) => {
    const result =
      table === 'tms_devoluciones'
        ? { data: mocks.rows, error: mocks.listError }
        : { data: [], error: null };
    const query = { then: (resolve) => Promise.resolve(result).then(resolve) };
    for (const method of ['select', 'order', 'limit', 'eq', 'or'])
      query[method] = vi.fn(() => query);
    return query;
  });
  mocks.rpc.mockImplementation(async (name) => {
    if (name === 'listar_devoluciones_pendientes_calidad')
      return { data: mocks.pending, error: mocks.queueError };
    if (name === 'historial_devolucion') return { data: [], error: null };
    throw new Error('Unexpected RPC: ' + name);
  });
  client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
});
afterEach(() => {
  cleanup();
  client.clear();
});

function mount(path = DEVOLUCIONES_QUALITY_PATH, withInboundLink = false) {
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        {withInboundLink && (
          <SidebarNavItem
            item={getNavGroups(() => true)
              .find((g) => g.id === 'inbound')
              .items.find((r) => r.path === DEVOLUCIONES_INBOUND_PATH)}
          />
        )}
        <Routes>
          <Route path={DEVOLUCIONES_INBOUND_PATH} element={<RecepcionDevoluciones />} />
          <Route path={DEVOLUCIONES_QUALITY_PATH} element={<RecepcionDevoluciones />} />
          <Route
            path={DEVOLUCIONES_LEGACY_PATH}
            element={<Navigate to={DEVOLUCIONES_INBOUND_PATH} replace />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}
async function manualForm(quality = 'true') {
  mount(DEVOLUCIONES_INBOUND_PATH);
  fireEvent.click(screen.getByRole('button', { name: 'Nueva recepción' }));
  fireEvent.click(screen.getByRole('button', { name: 'Registro manual' }));
  fireEvent.change(screen.getByLabelText(/^Cliente/), { target: { value: 'CLIENTE PRUEBA R5' } });
  fireEvent.change(screen.getByLabelText(/Motivo de devolución/), {
    target: { value: 'Prueba funcional conforme R5' }
  });
  fireEvent.change(screen.getByLabelText('SKU'), { target: { value: 'SKU-R5-TEST' } });
  fireEvent.change(screen.getByLabelText('Descripción'), {
    target: { value: 'ITEM SINTETICO R5' }
  });
  fireEvent.change(screen.getByLabelText('Detalle del producto'), {
    target: { value: 'Detalle sintético' }
  });
  fireEvent.change(screen.getByLabelText('Requiere revisión de Calidad'), {
    target: { value: quality }
  });
}
async function openReview() {
  const button = await screen.findByRole('button', { name: 'Revisar ítem' });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  fireEvent.change(screen.getByLabelText(/Dictamen oficial/), {
    target: { value: '  Prueba   conforme  ' }
  });
  fireEvent.click(screen.getByRole('checkbox', { name: /Confirmo/ }));
}

describe('R5 local: UI y hooks reales, transporte Supabase simulado', () => {
  it('ejecuta registro → bandeja → CONFORME con las firmas V2 y refresca el resultado', async () => {
    const fallback = mocks.rpc.getMockImplementation();
    mocks.rpc.mockImplementation(async (name, args) => {
      if (name === 'registrar_devolucion') {
        const item = pendingItem();
        mocks.pending = [item];
        mocks.rows = [
          {
            id: item.devolucion_id,
            folio: 1,
            cliente: item.cliente,
            recibido_en: item.recibido_en,
            estado: 'RECIBIDA',
            items: [
              { id: item.devolucion_item_id, ...args.p_payload.items[0], dictamen_calidad: null }
            ]
          }
        ];
        return {
          data: { id: item.devolucion_id, folio: item.folio, estado: 'RECIBIDA' },
          error: null
        };
      }
      if (name === 'dictaminar_item_devolucion') {
        mocks.pending = [];
        mocks.rows = mocks.rows.map((row) => ({
          ...row,
          estado: 'CONFORME',
          resultado_calidad: 'CONFORME',
          items: row.items.map((i) => ({ ...i, dictamen_calidad: 'CONFORME' }))
        }));
        return { data: { estado: 'CONFORME', dictamen: 'CONFORME' }, error: null };
      }
      return fallback(name, args);
    });
    await manualForm();
    fireEvent.click(screen.getByRole('button', { name: 'Registrar recepción' }));
    await waitFor(() =>
      expect(mocks.rpc).toHaveBeenCalledWith('registrar_devolucion', {
        p_payload: expect.objectContaining({
          origen: 'MANUAL',
          referencia_tipo: 'MANUAL',
          cliente: 'CLIENTE PRUEBA R5',
          operacion_id: null,
          consignacion_cliente_id: null,
          items: [
            expect.objectContaining({
              codigo_producto: 'SKU-R5-TEST',
              cantidad: 1,
              requiere_calidad: true
            })
          ]
        })
      })
    );
    fireEvent.click(screen.getByRole('link', { name: 'Pendientes de Devoluciones' }));
    await openReview();
    expect(screen.queryByRole('button', { name: /No conforme/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Crear caso en Post/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar CONFORME' }));
    await waitFor(() =>
      expect(mocks.rpc).toHaveBeenCalledWith('dictaminar_item_devolucion', {
        p_item_id: 'item-synthetic',
        p_dictamen: 'CONFORME',
        p_detalle: 'Prueba conforme'
      })
    );
    await screen.findByText('Sin ítems pendientes de Calidad');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('link', { name: 'Ir a Inbound · Devoluciones' }));
    expect((await screen.findAllByText('Conforme')).length).toBeGreaterThan(0);
    expect(
      mocks.rpc.mock.calls.every(([name]) =>
        [
          'registrar_devolucion',
          'listar_devoluciones_pendientes_calidad',
          'dictaminar_item_devolucion'
        ].includes(name)
      )
    ).toBe(true);
    const select = mocks.from.mock.results[0].value.select;
    expect(select).toHaveBeenCalledWith('*, items:tms_devolucion_items(*)');
  });

  it.each(['false', ''])(
    'preserva requiere_calidad=%s sin convertirlo en true',
    async (quality) => {
      await manualForm(quality);
      const fallback = mocks.rpc.getMockImplementation();
      mocks.rpc.mockImplementation(async (name, args) =>
        name === 'registrar_devolucion'
          ? { data: { folio: 'DEV-TEST' }, error: null }
          : fallback(name, args)
      );
      fireEvent.click(screen.getByRole('button', { name: 'Registrar recepción' }));
      await waitFor(() =>
        expect(mocks.rpc.mock.calls.some(([n]) => n === 'registrar_devolucion')).toBe(true)
      );
      const payload = mocks.rpc.mock.calls.find(([n]) => n === 'registrar_devolucion')[1].p_payload;
      if (quality === 'false') expect(payload.items[0].requiere_calidad).toBe(false);
      else expect(payload.items[0]).not.toHaveProperty('requiere_calidad');
      expect(payload).not.toHaveProperty('referencias');
    }
  );

  it('rechaza cantidad cero sin enviar registro', async () => {
    await manualForm();
    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar recepción' }));
    expect(toast.error).toHaveBeenCalledWith('La cantidad debe ser mayor que cero');
    expect(mocks.rpc.mock.calls.some(([n]) => n === 'registrar_devolucion')).toBe(false);
  });

  it('requiere confirmación y detalle para dictaminar un solo ítem', async () => {
    mocks.pending = [pendingItem()];
    mount();
    const review = await screen.findByRole('button', { name: 'Revisar ítem' });
    await waitFor(() => expect(review).toBeEnabled());
    fireEvent.click(review);
    expect(screen.getByRole('button', { name: 'Guardar CONFORME' })).toBeDisabled();
    expect(within(screen.getByRole('dialog')).getByText('Detalle sintético')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: /Confirmo/ }));
    fireEvent.change(screen.getByLabelText(/Dictamen oficial/), { target: { value: '  a  ' } });
    expect(screen.getByRole('button', { name: 'Guardar CONFORME' })).toBeDisabled();
  });

  it('no reintenta un dictamen rechazado ni permite enviarlo nuevamente en el mismo modal', async () => {
    mocks.pending = [pendingItem()];
    const fallback = mocks.rpc.getMockImplementation();
    mocks.rpc.mockImplementation(async (name, args) =>
      name === 'dictaminar_item_devolucion'
        ? { data: null, error: { message: 'El item ya tiene dictamen final', code: 'P0001' } }
        : fallback(name, args)
    );
    mount();
    await openReview();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar CONFORME' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('El item ya tiene dictamen final');
    expect(screen.getByRole('button', { name: 'Guardar CONFORME' })).toBeDisabled();
    expect(mocks.rpc.mock.calls.filter(([n]) => n === 'dictaminar_item_devolucion')).toHaveLength(
      1
    );
  });

  it('dictamina únicamente el ítem elegido y respeta EN_INSPECCION devuelto por el servidor', async () => {
    mocks.pending = [pendingItem('item-a'), pendingItem('item-b')];
    const fallback = mocks.rpc.getMockImplementation();
    mocks.rpc.mockImplementation(async (name, args) => {
      if (name === 'dictaminar_item_devolucion') {
        mocks.pending = mocks.pending.filter((i) => i.devolucion_item_id !== args.p_item_id);
        return { data: { estado: 'EN_INSPECCION', dictamen: 'CONFORME' }, error: null };
      }
      return fallback(name, args);
    });
    mount();
    const reviews = await screen.findAllByRole('button', { name: 'Revisar ítem' });
    await waitFor(() => expect(reviews[0]).toBeEnabled());
    fireEvent.click(reviews[0]);
    fireEvent.change(screen.getByLabelText(/Dictamen oficial/), {
      target: { value: 'Conforme revisado' }
    });
    fireEvent.click(screen.getByRole('checkbox', { name: /Confirmo/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar CONFORME' }));
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        'Ítem conforme. Estado de la devolución: En inspección'
      )
    );
    expect(mocks.rpc.mock.calls.filter(([n]) => n === 'dictaminar_item_devolucion')).toEqual([
      [
        'dictaminar_item_devolucion',
        { p_item_id: 'item-a', p_dictamen: 'CONFORME', p_detalle: 'Conforme revisado' }
      ]
    ]);
    expect(await screen.findAllByRole('button', { name: 'Revisar ítem' })).toHaveLength(1);
  });

  it('bloquea duplicados mientras el registro está en vuelo', async () => {
    await manualForm();
    let complete;
    const fallback = mocks.rpc.getMockImplementation();
    mocks.rpc.mockImplementation((name, args) =>
      name === 'registrar_devolucion'
        ? new Promise((resolve) => {
            complete = resolve;
          })
        : fallback(name, args)
    );
    const button = screen.getByRole('button', { name: 'Registrar recepción' });
    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    expect(screen.getByRole('button', { name: 'Cerrar', exact: true })).toBeDisabled();
    expect(mocks.rpc.mock.calls.filter(([n]) => n === 'registrar_devolucion')).toHaveLength(1);
    await act(async () => complete({ data: { folio: 'DEV-TEST' }, error: null }));
  });

  it('muestra fallo de registro sin reintento automático', async () => {
    await manualForm();
    const fallback = mocks.rpc.getMockImplementation();
    mocks.rpc.mockImplementation(async (name, args) =>
      name === 'registrar_devolucion'
        ? { data: null, error: { message: 'Acceso denegado', code: '42501' } }
        : fallback(name, args)
    );
    fireEvent.click(screen.getByRole('button', { name: 'Registrar recepción' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Acceso denegado');
    expect(screen.getByRole('button', { name: 'Registrar recepción' })).toBeDisabled();
    expect(mocks.rpc.mock.calls.filter(([n]) => n === 'registrar_devolucion')).toHaveLength(1);
  });

  it('muestra un error de bandeja sin confundirlo con ausencia de pendientes', async () => {
    mocks.queueError = { message: 'Acceso denegado', code: '42501' };
    mount();
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar la bandeja');
    expect(screen.queryByText('Sin ítems pendientes de Calidad')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Revisar ítem' })).not.toBeInTheDocument();
  });

  it('muestra errores de lectura de cabecera', async () => {
    mocks.listError = { message: 'Lectura rechazada' };
    mount(DEVOLUCIONES_INBOUND_PATH);
    expect(await screen.findByRole('alert')).toHaveTextContent('Lectura rechazada');
  });

  it('no consulta bandeja ni ofrece dictamen al usuario de recepción sin inspect_devoluciones', async () => {
    mocks.permissions = new Set(['manage_devoluciones']);
    mount(DEVOLUCIONES_INBOUND_PATH);
    await screen.findByText('Sin devoluciones para este filtro');
    expect(screen.getByRole('button', { name: 'Nueva recepción' })).toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'Bandeja de Calidad de devoluciones' })
    ).not.toBeInTheDocument();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('no ofrece registro a Calidad con permiso inspect únicamente', async () => {
    mocks.permissions = new Set(['inspect_devoluciones']);
    mount();
    await screen.findByText('Sin ítems pendientes de Calidad');
    expect(screen.queryByRole('button', { name: 'Nueva recepción' })).not.toBeInTheDocument();
    expect(mocks.rpc).toHaveBeenCalledWith('listar_devoluciones_pendientes_calidad', {
      p_limit: 100
    });
  });

  it('conserva el gate de ruta y el aislamiento de CCO 2.0', () => {
    const user = { rol: 'OPERADOR', es_admin_delegado: false };
    expect(puedeAccederRuta('/quality/devoluciones', user, (p) => p === 'view_devoluciones')).toBe(
      true
    );
    expect(puedeAccederRuta('/quality/devoluciones', user, () => false)).toBe(false);
    expect(puedeAccederRuta('/panel/rutas', user, (p) => p === 'view_devoluciones')).toBe(false);
  });
});

describe('R5-B1B — integración Inbound / pendientes Calidad', () => {
  const allowedGroups = (permissions = ['manage_devoluciones']) =>
    getNavGroups((path) =>
      puedeAccederRuta(path, { rol: 'OPERADOR' }, (p) => permissions.includes(p))
    );

  it('NAV_01: publica la entrada canónica bajo Inbound solo con acceso certificado', () => {
    const inbound = allowedGroups().find((group) => group.id === 'inbound');
    expect(inbound.items).toContainEqual(
      expect.objectContaining({
        path: DEVOLUCIONES_INBOUND_PATH,
        title: 'Inbound - Devoluciones'
      })
    );
    expect(
      allowedGroups([])
        .flatMap((group) => group.items)
        .some((r) => r.path === DEVOLUCIONES_INBOUND_PATH)
    ).toBe(false);
  });

  it('NAV_02: Calidad no es padre de recepción; el legado es solo compatibilidad', () => {
    const groups = allowedGroups(['inspect_devoluciones']);
    const quality = groups.find((g) => g.id === 'quality');
    expect(
      quality.items.every(
        (r) =>
          r.path !== DEVOLUCIONES_INBOUND_PATH &&
          r.path !== DEVOLUCIONES_LEGACY_PATH &&
          !r.title.includes('Recepción')
      )
    ).toBe(true);
    mount(DEVOLUCIONES_LEGACY_PATH);
    expect(screen.getByText('Inbound · trazabilidad operativa')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nueva recepción' })).toBeInTheDocument();
  });

  it('NAV_03: Calidad muestra solo pendientes e inspección, nunca registro', async () => {
    const quality = allowedGroups(['inspect_devoluciones']).find((g) => g.id === 'quality');
    expect(quality.items).toContainEqual(
      expect.objectContaining({
        path: DEVOLUCIONES_QUALITY_PATH,
        title: 'Calidad - Pendientes de Devoluciones'
      })
    );
    mount();
    await screen.findByText('Sin ítems pendientes de Calidad');
    expect(screen.queryByRole('button', { name: 'Nueva recepción' })).not.toBeInTheDocument();
    expect(mocks.from).not.toHaveBeenCalledWith('tms_devoluciones');
  });

  it('NAV_04: enlace real de navegación Inbound abre recepción y no monta inspección', async () => {
    mount(DEVOLUCIONES_QUALITY_PATH, true);
    await screen.findByText('Sin ítems pendientes de Calidad');
    fireEvent.click(screen.getByRole('link', { name: 'Devoluciones', exact: true }));
    expect(screen.getByRole('heading', { name: 'Recepción de Devoluciones' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nueva recepción' })).toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'Bandeja de Calidad de devoluciones' })
    ).not.toBeInTheDocument();
  });

  it('NAV_05: router usa la misma página y la misma fuente de servicio/RPC', () => {
    const app = fs.readFileSync('src/App.jsx', 'utf8');
    expect(app.match(/import\('\.\/pages\/Quality\/RecepcionDevoluciones'\)/g)).toHaveLength(1);
    expect(app.match(/<RecepcionDevoluciones \/>/g)).toHaveLength(2);
    expect(app).toContain('element={<Navigate to={DEVOLUCIONES_INBOUND_PATH} replace />}');
    expect(app).toContain('const accessPath = devolucionesAccessPath(location.pathname)');
    expect(app).toContain('canAccessRoute(accessPath)');
    expect(app).toContain('accessDecisionForRoute(accessPath)');
    const page = fs.readFileSync(
      'src/pages/Quality/RecepcionDevoluciones.jsx',
      'utf8'
    );
    expect(page.match(/services\/devolucionesService/g)).toHaveLength(1);
    expect(page).not.toMatch(/\.rpc\(/);
  });

  it('NAV_06: URL directa reutiliza el guard y no abre prefijos desconocidos', () => {
    for (const path of [
      DEVOLUCIONES_INBOUND_PATH,
      DEVOLUCIONES_QUALITY_PATH,
      '/INBOUND/DEVOLUCIONES/',
      '/QUALITY/DEVOLUCIONES/PENDIENTES/'
    ]) {
      expect(devolucionesAccessPath(path)).toBe(DEVOLUCIONES_LEGACY_PATH);
      expect(puedeAccederRuta(devolucionesAccessPath(path), { rol: 'OPERADOR' }, () => false)).toBe(
        false
      );
    }
    expect(devolucionesAccessPath('/inbound/devoluciones/otra')).toBe('/inbound/devoluciones/otra');
    expect(devolucionesAccessPath('/admin/users')).toBe('/admin/users');
  });

  it('NAV_07: paridad de permisos y overrides ALLOW/DENY, sin ganancia ni pérdida', () => {
    const permissions = ['view_devoluciones', 'manage_devoluciones', 'inspect_devoluciones'];
    for (let mask = 0; mask < 8; mask++) {
      const perms = permissions.filter((_, bit) => mask & (1 << bit));
      const user = { rol: 'OPERADOR' };
      const legacy = puedeAccederRuta(DEVOLUCIONES_LEGACY_PATH, user, (p) => perms.includes(p));
      for (const mode of ['SHADOW', 'ENFORCE']) {
        for (const access of [null, 'ALLOW', 'DENY']) {
          const runtime = buildRuntimeAccess({
            perms,
            context: {
              mode,
              overrides: access
                ? [{ surface_type: 'screen', surface_id: 'quality.devoluciones', access }]
                : []
            }
          });
          const expected = runtimeAllowsPath(runtime, DEVOLUCIONES_LEGACY_PATH, legacy);
          for (const path of [DEVOLUCIONES_INBOUND_PATH, DEVOLUCIONES_QUALITY_PATH]) {
            const key = devolucionesAccessPath(path);
            expect(puedeAccederRuta(key, user, (p) => perms.includes(p))).toBe(legacy);
            expect(runtimeAllowsPath(runtime, key, legacy)).toBe(expected);
          }
        }
      }
    }
  });
});
