import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

// ── Datos con forma de CCO (los que devolverían las RPC/tablas reales) ──────
const TICKETS = [
  { id: 't1', numero: 'TKT-2026-001', fecha_apertura: '2026-07-09', cliente: 'Hospital Regional', region: 'Metropolitana de Santiago',
    contacto: null, equipo_modelo: 'ADE X100', numero_serie: 'SN-1', tipo_solicitud: 'Falla Técnica', prioridad: 'Alta',
    tecnico_asignado: 'Cesar Tapia', estado: 'Abierto', descripcion: 'Equipo no enciende', cotizar: 'No',
    fecha_cierre: null, resultado: null, observaciones: null, origen: 'Manual' },
  { id: 't2', numero: 'TKT-2026-002', fecha_apertura: '2026-07-08', cliente: 'Clínica Correo', region: 'Valparaíso',
    contacto: null, equipo_modelo: 'GIVAS V2', numero_serie: null, tipo_solicitud: 'Otro', prioridad: 'Media',
    tecnico_asignado: 'Sin Asignar', estado: 'Cerrado', descripcion: 'Desde correo', cotizar: 'No',
    fecha_cierre: '2026-07-09', resultado: 'Resuelto', observaciones: null, origen: 'Correo' },
];
const TECNICOS = [
  { id: 'tec1', nombre: 'Cesar Tapia', activo: true, orden: 1 },
  { id: 'tec2', nombre: 'Sin Asignar', activo: true, orden: 99 },
];
const DASHBOARD = {
  resumen: { total: 2, abiertos: 1, en_proceso: 0, pendiente_cliente: 0, cerrados: 1, prioridad_alta: 1 },
  tiempos: { promedio_dias: 1, min_dias: 1, max_dias: 1, cerrados_mes: 1, sin_tecnico: 1 },
  por_tipo: { 'Falla Técnica': 1, 'Otro': 1 },
  por_estado: { Abierto: 1, Cerrado: 1 },
  por_tecnico: { 'Cesar Tapia': { total: 1, abiertos: 1 }, 'Sin Asignar': { total: 1, abiertos: 0 } },
  tickets_recientes: TICKETS,
};

const TABLE_DATA = {
  tms_postventa_tickets: TICKETS,
  tms_postventa_tecnicos: TECNICOS,
};
const RPC_DATA = {
  pv_dashboard: DASHBOARD,
  crear_pv_ticket: TICKETS[0],
  actualizar_pv_ticket: TICKETS[0],
};

function builder(data) {
  const res = { data, error: null };
  const b = {};
  ['select', 'order', 'limit', 'eq', 'is', 'or', 'ilike', 'gte', 'lte', 'in', 'range', 'not'].forEach((m) => (b[m] = () => b));
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

import Postventa from '../pages/Postventa/Postventa';

function wrap(ui) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>);
}

describe('Post-Venta / Servicio Técnico (integrado en CCO)', () => {
  beforeEach(() => cleanup());

  it('monta el módulo y lista los tickets de CCO', async () => {
    wrap(<Postventa />);
    expect(screen.getByRole('heading', { name: /Servicio/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('TKT-2026-001')).toBeInTheDocument());
    // Chip de estado + prioridad del ticket.
    expect(screen.getByText('Hospital Regional')).toBeInTheDocument();
    expect(screen.getAllByText('Abierto').length).toBeGreaterThan(0);
  });

  it('la pestaña Dashboard muestra los KPIs derivados del stock de tickets', async () => {
    wrap(<Postventa />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    // KPI "Total" = 2 y carga por técnico.
    await waitFor(() => expect(screen.getByText('Carga por técnico')).toBeInTheDocument());
    expect(screen.getByText('Tiempos de resolución')).toBeInTheDocument();
  });

  it('la pestaña Nuevo Ticket muestra el formulario de alta con catálogos', async () => {
    wrap(<Postventa />);
    fireEvent.click(screen.getByRole('button', { name: /Nuevo Ticket/i }));
    await waitFor(() => expect(screen.getByText(/Nuevo ticket de servicio/i)).toBeInTheDocument());
    expect(screen.getByText(/Cliente \/ Hospital/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear Ticket/i })).toBeInTheDocument();
  });

  it('la pestaña Calendario muestra la grilla mensual y ubica tickets por fecha', async () => {
    wrap(<Postventa />);
    fireEvent.click(screen.getByRole('button', { name: /Calendario/i }));
    await waitFor(() => expect(screen.getByText('Lun')).toBeInTheDocument());
    // Encabezados de días de la semana + control "Ubicar por".
    expect(screen.getByText('Dom')).toBeInTheDocument();
    expect(screen.getByText(/Ubicar por/i)).toBeInTheDocument();
  });

  it('la pestaña Técnicos (supervisor) lista el catálogo editable', async () => {
    wrap(<Postventa />);
    fireEvent.click(screen.getByRole('button', { name: /Técnicos/i }));
    expect(screen.getByPlaceholderText(/Nombre del técnico/i)).toBeInTheDocument();
    // El catálogo sembrado aparece (carga asíncrona).
    await waitFor(() => expect(screen.getByText('Cesar Tapia')).toBeInTheDocument());
  });
});
