import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

// ── Datos con forma de CCO (los que devolverían las RPC/tablas reales) ──────
const SESIONES = [{ id: 's1', nombre: 'Semana 28', descripcion: null, tipo: 'ciclico', estado: 'abierta', semana: 28, creado_por_nombre: 'QA' }];
const CONCIL = [{ codigo_producto: '0010950005', descripcion: 'APOSITO NO TEJIDO - ALGODON 10X20', unidad_medida: 'UNI', contado: 5, sistema: 150, diferencia: -145, costo_unitario: 1000, impacto: -145000, estado: 'FALTA' }];
const AJUSTE = [{ codigo_producto: '0010950005', descripcion: 'APOSITO', partida: '(sin partida)', contado: 5, sistema: 150, diferencia: -145, costo_unitario: 1000, impacto: -145000, estado: 'FALTA' }];
const LOTES = [{ tipo: 'P', valor: 'L-001', disponible: 150, ubicacion: 'G-01-01' }];

const TABLE_DATA = {
  tms_conteo_sesiones: SESIONES,
  tms_conteos: [],
  tms_conteo_bloques: [],
  tms_conteo_bloque_items: [],
  tms_conteo_auditorias: [],
  tms_conteo_proyecciones: [],
};
const RPC_DATA = {
  conteo_conciliacion: CONCIL,
  conteo_ajuste_erp: AJUSTE,
  calidad_lotes_series: LOTES,
  crear_conteo_sesion: { id: 's2', nombre: 'Nueva', estado: 'abierta' },
  registrar_conteo: { codigo_producto: '0010950005', cantidad_contada: 5, cantidad_sistema: 150, estado: 'FALTA', partida: '', serie: '' },
};

// Builder encadenable que resuelve a { data, error } (soporta await y maybeSingle).
function builder(data) {
  const res = { data, error: null };
  const b = {};
  ['select', 'order', 'limit', 'eq', 'is', 'or', 'ilike', 'gte', 'lte', 'in', 'range'].forEach((m) => (b[m] = () => b));
  b.maybeSingle = () => Promise.resolve({ data: Array.isArray(data) ? (data[0] || null) : data, error: null });
  b.single = b.maybeSingle;
  b.then = (resolve) => resolve(res);
  return b;
}

vi.mock('../supabase', () => ({
  supabase: {
    from: (table) => builder(TABLE_DATA[table] ?? []),
    rpc: (name) => Promise.resolve({ data: RPC_DATA[name] ?? [], error: null }),
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', rol: 'ADMIN', es_admin_delegado: false, nombre: 'QA Tester' },
    hasPermission: () => true,
    logout: vi.fn(),
  }),
}));

// Dependencias nativas del PDA
vi.mock('../hooks/useBarcodeScanner', () => ({ default: () => ({ startScan: vi.fn(), isScanning: false, isSupportedDevice: false }) }));
vi.mock('@capacitor/haptics', () => ({ Haptics: { impact: vi.fn() }, ImpactStyle: { Light: 'L', Heavy: 'H' } }));

import ConteoCiclico from '../pages/Inventory/ConteoCiclico';
import ConteoPDA from '../pages/Mobile/ConteoPDA';

function wrap(ui, route = '/inventory/conteo') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}><MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter></QueryClientProvider>);
}

describe('Conteo Cíclico — módulo de escritorio (integrado en CCO)', () => {
  beforeEach(() => cleanup());

  it('monta el módulo y lista las sesiones de CCO', async () => {
    wrap(<ConteoCiclico />);
    expect(screen.getByRole('heading', { name: /Conteo Cíclico/i })).toBeInTheDocument();
    // Aparece en el selector de sesión y en la tarjeta de la pestaña Sesiones.
    await waitFor(() => expect(screen.getAllByText('Semana 28').length).toBeGreaterThan(0));
  });

  it('la sección Conciliación (deep-link ?tab=conciliacion) muestra el impacto valorizado', async () => {
    wrap(<ConteoCiclico />, '/inventory/conteo?tab=conciliacion');
    // Fila del SKU real + estado FALTA calculado (contado 5 vs sistema 150).
    await waitFor(() => expect(screen.getByText('0010950005')).toBeInTheDocument());
    expect(screen.getByText('FALTA')).toBeInTheDocument();
    // Exactitud KPI (0% porque el único SKU no cuadra).
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('la sección Ajuste ERP (deep-link ?tab=ajuste) renderiza la tabla por SKU+partida', async () => {
    wrap(<ConteoCiclico />, '/inventory/conteo?tab=ajuste');
    await waitFor(() => expect(screen.getByText('(sin partida)')).toBeInTheDocument());
  });

  it('la pestaña Contar (por defecto) muestra el formulario de registro de conteo', async () => {
    wrap(<ConteoCiclico />);
    // Pestaña por defecto = Contar: campos del formulario visibles.
    expect(screen.getByText('Ubicación')).toBeInTheDocument();
    expect(screen.getByText('Cantidad contada')).toBeInTheDocument();
    expect(screen.getByText('Producto (código o descripción)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registrar conteo/i })).toBeInTheDocument();
  });
});

describe('Conteo Cíclico — PDA (integrado en CCO)', () => {
  beforeEach(() => cleanup());

  it('monta el selector de sesión y permite entrar a contar', async () => {
    wrap(<ConteoPDA onHome={vi.fn()} />);
    expect(screen.getByText('CONTEO CÍCLICO')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Semana 28')).toBeInTheDocument());
    // Entrar a contar sin sesión → aparece el formulario de conteo.
    fireEvent.click(screen.getByText('CONTAR SIN SESIÓN'));
    await waitFor(() => expect(screen.getByText(/Cantidad contada/i)).toBeInTheDocument());
    expect(screen.getByText(/Producto \(SKU\)/i)).toBeInTheDocument();
  });
});
