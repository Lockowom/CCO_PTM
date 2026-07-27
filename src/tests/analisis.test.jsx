import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

// ── Datos con la forma real de las RPCs (migración 067) ─────────────────────
const RESUMEN = {
  total: 4,
  nuevos_p: 1,
  nuevos_s: 1,
  antiguos: 2,
  antiguos_disp: 1,
  antiguos_sin_disp: 1,
  antiguos_dup: 1,
  anomalias: 1,
  activos: 1,
  no_activos: 2,
  no_encontrados: 1,
  no_activos_stock: 1,
  stock_cargado_el: '2026-07-10T12:00:00Z',
  activo_filas: 3,
  activo_cargado_el: '2026-07-10T12:00:00Z'
};
const FILAS = [
  {
    codigo: 'NGE10500035P',
    producto: 'TAPA ROJA',
    unidad_medida: 'UNI',
    disponible: 10,
    reserva: 0,
    transitoria: 0,
    consignacion: 0,
    stock_total: 10,
    estado: 'Nuevo (P)',
    antiguo_disponible: false,
    duplicado: '',
    ps_equivalente: '',
    activo: 'Si',
    no_activo_stock: false,
    anomalia: null
  },
  {
    codigo: 'N010500035',
    producto: 'TAPA ROJA',
    unidad_medida: 'UNI',
    disponible: 0,
    reserva: 0,
    transitoria: 805,
    consignacion: 0,
    stock_total: 805,
    estado: 'Antiguo',
    antiguo_disponible: false,
    duplicado: 'Sí (duplicado)',
    ps_equivalente: 'NGE10500035P',
    activo: 'No',
    no_activo_stock: true,
    anomalia: null
  },
  {
    codigo: '0GI',
    producto: 'PAR DE ASAS',
    unidad_medida: 'UNI',
    disponible: 0,
    reserva: 0,
    transitoria: 0,
    consignacion: 0,
    stock_total: 0,
    estado: 'Antiguo',
    antiguo_disponible: false,
    duplicado: 'No',
    ps_equivalente: '',
    activo: 'No encontrado',
    no_activo_stock: false,
    anomalia: 'Código incompleto (3 caracteres)'
  }
];

vi.mock('../supabase', () => ({
  supabase: {
    rpc: (name, params) => {
      if (name === 'analisis_codigos_resumen')
        return Promise.resolve({ data: RESUMEN, error: null });
      if (name === 'analisis_codigos') {
        // El mock respeta p_filtro igual que la RPC real (mig 067).
        const f = params?.p_filtro || 'todos';
        const data = FILAS.filter((r) =>
          f === 'anomalias'
            ? !!r.anomalia
            : f === 'duplicados'
              ? r.duplicado === 'Sí (duplicado)'
              : f === 'antiguos_disp'
                ? r.antiguo_disponible
                : f === 'no_activos_stock'
                  ? r.no_activo_stock
                  : f === 'antiguos'
                    ? r.estado === 'Antiguo'
                    : true
        );
        return Promise.resolve({ data, error: null });
      }
      return Promise.resolve({ data: [], error: null });
    },
    from: () => ({ select: () => ({ then: (r) => r({ data: [], error: null }) }) })
  }
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', rol: 'ADMIN', es_admin_delegado: false, nombre: 'QA' },
    hasPermission: () => true,
    logout: vi.fn()
  })
}));

import AnalisisCodigos from '../pages/Inventory/AnalisisCodigos';

function wrap(ui, route = '/inventory/analisis') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Análisis de Códigos (Inventario) — port del Excel', () => {
  beforeEach(() => cleanup());

  it('el Resumen muestra los KPIs del Excel (totales y alertas)', async () => {
    wrap(<AnalisisCodigos />);
    expect(screen.getByRole('heading', { name: /Análisis de/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Antiguos (faltan P/S)')).toBeInTheDocument());
    expect(screen.getByText('Nuevos con P')).toBeInTheDocument();
    expect(screen.getByText('NO activos que AÚN tienen stock')).toBeInTheDocument();
    // Fuentes de datos con carga del catálogo ACTIVO
    expect(screen.getAllByText(/Catálogo ACTIVO/i).length).toBeGreaterThan(0);
  });

  it('deep-link ?tab=anomalias lista el diagnóstico del código', async () => {
    wrap(<AnalisisCodigos />, '/inventory/analisis?tab=anomalias');
    await waitFor(() => expect(screen.getByText('0GI')).toBeInTheDocument());
    expect(screen.getByText(/Código incompleto/)).toBeInTheDocument();
  });

  it('deep-link ?tab=duplicados muestra el código P/S equivalente', async () => {
    wrap(<AnalisisCodigos />, '/inventory/analisis?tab=duplicados');
    await waitFor(() => expect(screen.getByText('N010500035')).toBeInTheDocument());
    expect(screen.getByText('NGE10500035P')).toBeInTheDocument();
  });

  it('la tabla es dinámica: filtros por columna, totales y selección → Ajuste/Traspaso', async () => {
    const { fireEvent } = await import('@testing-library/react');
    wrap(<AnalisisCodigos />, '/inventory/analisis?tab=antiguos');
    await waitFor(() => expect(screen.getByText('N010500035')).toBeInTheDocument());
    // Filtros tipo tabla dinámica + fila de totales
    expect(screen.getByText('Estado: todos')).toBeInTheDocument();
    expect(screen.getByText('Alertas: todas')).toBeInTheDocument();
    expect(screen.getByText(/TOTAL \(/)).toBeInTheDocument();
    // Seleccionar una fila → aparece la barra de acciones
    const checks = screen.getAllByRole('checkbox');
    fireEvent.click(checks[1]);
    await waitFor(() => expect(screen.getByText(/Generar Ajuste/)).toBeInTheDocument());
    expect(screen.getByText(/Generar Traspaso/)).toBeInTheDocument();
  });

  it('correo de Actualización de Códigos: crear con P/S y vencimiento requerido si P', async () => {
    const { fireEvent } = await import('@testing-library/react');
    wrap(<AnalisisCodigos />, '/inventory/analisis?tab=duplicados');
    await waitFor(() => expect(screen.getByText('N010500035')).toBeInTheDocument());
    fireEvent.click(screen.getAllByRole('checkbox')[1]);
    fireEvent.click(await screen.findByText(/Correo Actualización de Códigos/));
    // El modal precarga el código P/S equivalente y el selector Crear con P/S
    await waitFor(() =>
      expect(screen.getByText(/Correo · Actualización de Códigos/)).toBeInTheDocument()
    );
    expect(screen.getByDisplayValue('NGE10500035P')).toBeInTheDocument();
    expect(screen.getByDisplayValue(/P \(con vencimiento\)/)).toBeInTheDocument();
    // Con creación P y sin fecha, avisa que falta el vencimiento
    expect(screen.getByText(/Falta la fecha de vencimiento/)).toBeInTheDocument();
    expect(screen.getByText(/ACTUALIZACIÓN DE CÓDIGOS/)).toBeInTheDocument();
  });
});
