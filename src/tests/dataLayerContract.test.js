import { describe, expect, it } from 'vitest';

// PR-010 · capa común de datos/errores — contrato.
// AppError / normalizeError / result / queryKeys son la base compartida. Este
// test fija el contrato para que no cambien su forma por accidente.

import {
  AppError,
  normalizeError,
  ERROR_CODES,
  businessError,
  rethrowAsAppError
} from '../core/domain/appError';
import { ok, fail, isFailure, unwrapResult } from '../core/domain/result';
import { createQueryKeyFactory } from '../core/application/queryKeys';

describe('PR-010 · AppError', () => {
  it('tiene shape estable { name, code, module, action, status, context, cause }', () => {
    const err = new AppError('fallo');
    expect(err.name).toBe('AppError');
    expect(err.code).toBe('APP_ERROR');
    expect(err.module).toBe('app');
    expect(err.action).toBe('unspecified');
    expect(err.status).toBe('error');
    expect(typeof err.context).toBe('object');
  });

  it('normalizeError preserva AppError y envuelve Error/string', () => {
    const appErr = new AppError('x', { code: 'FOO' });
    expect(normalizeError(appErr)).toBe(appErr);
    const wrapped = normalizeError(new Error('boom'), { code: 'BAR' });
    expect(wrapped).toBeInstanceOf(AppError);
    expect(wrapped.code).toBe('BAR');
    expect(wrapped.cause).toBeInstanceOf(Error);
    const fromString = normalizeError('texto', { module: 'm' });
    expect(fromString.message).toBe('texto');
    expect(fromString.module).toBe('m');
  });

  it('businessError crea AppError con código estándar', () => {
    const err = businessError(ERROR_CODES.NOT_FOUND, 'NV no encontrada', { action: 'get' });
    expect(err.code).toBe(ERROR_CODES.NOT_FOUND);
    expect(err.action).toBe('get');
  });

  it('los códigos estándar existen y son únicos', () => {
    const vals = Object.values(ERROR_CODES);
    expect(new Set(vals).size).toBe(vals.length);
    expect(vals).toContain('NETWORK_ERROR');
    expect(vals).toContain('CONFLICT');
    expect(vals).toContain('RLS_DENIED');
  });

  it('rethrowAsAppError normaliza sin doble envoltura', () => {
    const appErr = businessError(ERROR_CODES.OFFLINE, 'sin red');
    expect(rethrowAsAppError(appErr)).toBe(appErr);
  });
});

describe('PR-010 · Result', () => {
  it('ok/fail construyen discriminantes { ok }', () => {
    expect(ok('v')).toEqual({ ok: true, value: 'v', meta: {} });
    expect(isFailure(ok('v'))).toBe(false);
    expect(isFailure(fail('e'))).toBe(true);
  });

  it('unwrapResult devuelve value o lanza el error', () => {
    expect(unwrapResult(ok(42))).toBe(42);
    expect(() => unwrapResult(fail('e'))).toThrow('e');
    const appErr = businessError(ERROR_CODES.CONFLICT, 'conflicto');
    expect(() => unwrapResult(fail(appErr))).toThrow(appErr);
  });
});

describe('PR-010 · query keys', () => {
  it('createQueryKeyFactory genera claves predecibles por scope', () => {
    const nv = createQueryKeyFactory('nv');
    expect(nv.all()).toEqual(['nv']);
    expect(nv.list({ q: '1' })).toEqual(['nv', 'list', { q: '1' }]);
    expect(nv.detail(7)).toEqual(['nv', 'detail', 7]);
    expect(nv.action('update', { id: 1 })).toEqual(['nv', 'update', { id: 1 }]);
  });
});