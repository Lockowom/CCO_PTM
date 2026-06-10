import { describe, it, expect, vi } from 'vitest';
import { withTimeout, unwrap } from '../lib/supabaseQuery';

describe('withTimeout', () => {
  it('resuelve con el valor cuando la promesa es rápida', async () => {
    const result = await withTimeout(Promise.resolve({ data: [1, 2], error: null }), { ms: 100 });
    expect(result).toEqual({ data: [1, 2], error: null });
  });

  it('rechaza con el mensaje localizado cuando una promesa cruda vence', async () => {
    const lenta = new Promise((resolve) => setTimeout(() => resolve('tarde'), 200));
    await expect(withTimeout(lenta, { ms: 20, label: 'prueba' })).rejects.toThrow(
      /tardó demasiado.*timeout 0s.*prueba/i
    );
  });

  it('adjunta .abortSignal cuando recibe un query builder y aborta al vencer', async () => {
    let receivedSignal = null;
    // Builder simulado: thenable con .abortSignal que nunca resuelve hasta el abort.
    const builder = {
      abortSignal(signal) {
        receivedSignal = signal;
        return new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => {
            const err = new Error('aborted');
            err.name = 'AbortError';
            reject(err);
          });
        });
      },
    };

    await expect(withTimeout(builder, { ms: 20, label: 'builder' })).rejects.toThrow(
      /tardó demasiado/i
    );
    expect(receivedSignal).toBeInstanceOf(AbortSignal);
    expect(receivedSignal.aborted).toBe(true);
  });

  it('devuelve el resultado del builder cuando responde a tiempo', async () => {
    const builder = {
      abortSignal: vi.fn().mockResolvedValue({ data: 'ok', error: null }),
    };
    const result = await withTimeout(builder, { ms: 100 });
    expect(result).toEqual({ data: 'ok', error: null });
    expect(builder.abortSignal).toHaveBeenCalledOnce();
  });
});

describe('unwrap', () => {
  it('devuelve data cuando no hay error', () => {
    expect(unwrap({ data: 42, error: null })).toBe(42);
  });

  it('lanza el error cuando existe', () => {
    const error = new Error('boom');
    expect(() => unwrap({ data: null, error })).toThrow('boom');
  });
});
