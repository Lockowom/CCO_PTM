import { describe, expect, it } from 'vitest';
import { resolveShellRuntime } from '../components/shell/shellRuntime';

describe('CCO 2.0 shell cutover', () => {
  it('activa la ruta V2 cuando el flag está ON', () => {
    expect(resolveShellRuntime({ webShellEnabled: true })).toBe('v2');
  });

  it('mantiene rollback inmediato al layout legacy cuando el flag está OFF', () => {
    expect(resolveShellRuntime({ webShellEnabled: false })).toBe('legacy');
  });
});
