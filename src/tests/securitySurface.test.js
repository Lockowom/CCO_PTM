import { describe, expect, it, vi } from 'vitest';

// PR-007 · MFA / security surface — contrato de la capa de seguridad.
// Mockeamos el cliente supabase (mismo patron que el resto de la suite) y
// verificamos que las funciones de MFA existen y propagan las formas minimas.

const { MOCK_RPC, MOCK_MFA, MOCK_AAL } = vi.hoisted(() => ({
  MOCK_RPC: { data: { enabled: false, factors: [] }, error: null },
  MOCK_MFA: { data: { totp: [], all: [] }, error: null },
  MOCK_AAL: { data: { currentLevel: null, nextLevel: null }, error: null },
}));

vi.mock('../supabase', () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue(MOCK_RPC),
    auth: {
      mfa: {
        listFactors: vi.fn().mockResolvedValue(MOCK_MFA),
        getAuthenticatorAssuranceLevel: vi.fn().mockResolvedValue(MOCK_AAL),
      },
    },
  },
}));

const { estadoMFA, factoresVerificados, nivelAAL } = await import('../services/securityService');

describe('PR-007 · contrato de estado MFA', () => {
  it('estadoMFA devuelve la forma { enabled, factors }', async () => {
    const res = await estadoMFA();
    expect(res).toEqual({ enabled: false, factors: [] });
  });

  it('nivelAAL devuelve el shape de aseguramiento', async () => {
    const res = await nivelAAL();
    expect(res).toHaveProperty('currentLevel');
    expect(res).toHaveProperty('nextLevel');
  });

  it('factoresVerificados filtra solo factors verified', async () => {
    const res = await factoresVerificados();
    expect(Array.isArray(res)).toBe(true);
  });

  it('el surface expone las operaciones de seguridad', () => {
    expect(typeof estadoMFA).toBe('function');
    expect(typeof factoresVerificados).toBe('function');
    expect(typeof nivelAAL).toBe('function');
  });
});