import { describe, it, expect, vi } from 'vitest';

// Fila de prueba (hoisted para poder usarla dentro del mock del cliente supabase).
const { FILA } = vi.hoisted(() => ({
  FILA: {
    nv_ptm: 97369, cliente: 'BLUE PANDA SPA', vendedor: 'Sebastian Fraiman',
    factura: null, guia: 'G-123', transportista: null, empresa_transporte: 'STARKEN',
    bultos: 4, estado: 'Shipping', tipo_despacho: 'Normal', urgente: true,
    numero_envio: 'ENV-9', fecha_compromiso: '2026-07-14', fecha_despacho: null,
    centro_costo: 'CC1', division: 'MED',
  },
}));

// El servicio ahora lee tms_operaciones EN EL PROYECTO CCO (cliente autenticado),
// no un proyecto externo. Mockeamos el cliente supabase con un builder encadenable
// que devuelve FILA solo cuando se consulta por nv_ptm = 97369.
vi.mock('../supabase', () => ({
  supabase: {
    from: () => {
      let nvArg = null;
      const b = {
        select: () => b,
        eq: (_col, v) => { nvArg = v; return b; },
        order: () => b,
        limit: () => Promise.resolve({ data: nvArg === 97369 ? [FILA] : [], error: null }),
      };
      return b;
    },
  },
}));

const { fetchNvPanel, mapNvPanel } = await import('../services/panelPtm');

describe('Info de la N.V para Calidad · Salida (tms_operaciones CCO)', () => {
  it('mapNvPanel normaliza la fila (transportista cae a empresa_transporte)', () => {
    const i = mapNvPanel(FILA);
    expect(i.nv).toBe('97369');
    expect(i.cliente).toBe('BLUE PANDA SPA');
    expect(i.transportista).toBe('STARKEN');
    expect(i.bultos).toBe('4');
    expect(i.urgente).toBe(true);
    expect(mapNvPanel(null)).toBeNull();
  });

  it('fetchNvPanel consulta por número exacto y devuelve null si no existe', async () => {
    const i = await fetchNvPanel(' 97369 ');
    expect(i.cliente).toBe('BLUE PANDA SPA');
    expect(await fetchNvPanel('1')).toBeNull();
    expect(await fetchNvPanel('')).toBeNull();
  });
});
