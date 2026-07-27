export function ok(value, meta = {}) {
  return { ok: true, value, meta };
}

export function fail(error, meta = {}) {
  return { ok: false, error, meta };
}

export function isFailure(result) {
  return result?.ok === false;
}

export function unwrapResult(result, fallbackMessage = 'Operacion fallida') {
  if (isFailure(result)) {
    throw result.error instanceof Error
      ? result.error
      : new Error(result.error?.message || fallbackMessage);
  }
  return result?.value;
}
