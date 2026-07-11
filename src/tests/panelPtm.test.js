import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchNvPanel, mapNvPanel } from '../services/panelPtm';

const FILA = {
  nv_ptm: 97369, cliente: 'BLUE PANDA SPA', vendedor: 'Sebastian Fraiman',
  factura: null, guia: 'G-123', transportista: null, empresa_transporte: 'STARKEN',
  bultos: 4, estado: 'Shipping', tipo_despacho: 'Normal', urgente: true,
  numero_envio: 'ENV-9', fecha_compromiso: '2026-07-14', fecha_despacho: null,
  centro_costo: 'CC1', division: 'MED',
};

describe('Panel Dashboard PTM — info de la N.V para Calidad · Salida', () => {
  afterEach(() => vi.unstubAllGlobals());

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
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [FILA] });
    vi.stubGlobal('fetch', fetchMock);
    const i = await fetchNvPanel(' 97369 ');
    expect(fetchMock.mock.calls[0][0]).toContain('nv_ptm=eq.97369');
    expect(i.cliente).toBe('BLUE PANDA SPA');

    fetchMock.mockResolvedValue({ ok: true, json: async () => [] });
    expect(await fetchNvPanel('1')).toBeNull();
    expect(await fetchNvPanel('')).toBeNull();
  });
});
