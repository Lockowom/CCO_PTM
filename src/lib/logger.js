import { supabase } from '../supabase';
import { logError as sentryLogError } from './sentry';

const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
const MAX_QUEUE_SIZE = 100;
const MAX_STRING_LEN = 4000;
const DEFAULT_KIND = 'application';

const loggerState = {
  sessionId: createId(),
  user: null,
  queue: [],
  flushing: false,
  handlersInstalled: false,
  appContext: {
    appVersion: APP_VERSION,
    source: 'frontend',
  },
};

function createId() {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch {
    // noop
  }
  return `log-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function truncate(value, max = MAX_STRING_LEN) {
  const text = String(value ?? '');
  return text.length > max ? `${text.slice(0, max - 12)}...[truncated]` : text;
}

function safeSerialize(value, depth = 4, seen = new WeakSet()) {
  if (value == null) return value;
  if (depth <= 0) return '[max-depth]';
  if (value instanceof Error) {
    return {
      name: value.name,
      message: truncate(value.message),
      stack: truncate(value.stack || '', 12000),
    };
  }
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.slice(0, 50).map((item) => safeSerialize(item, depth - 1, seen));
  if (typeof value === 'object') {
    if (seen.has(value)) return '[circular]';
    seen.add(value);
    const out = {};
    Object.entries(value).slice(0, 60).forEach(([key, item]) => {
      out[key] = safeSerialize(item, depth - 1, seen);
    });
    seen.delete(value);
    return out;
  }
  if (typeof value === 'string') return truncate(value);
  return value;
}

function currentRoute() {
  if (typeof window === 'undefined') return '';
  return `${window.location.pathname || ''}${window.location.search || ''}`;
}

function inferModule(route) {
  const pathname = String(route || '').split('?')[0];
  const parts = pathname.split('/').filter(Boolean);
  return parts[0] || 'app';
}

function browserInfo() {
  if (typeof window === 'undefined') return {};
  return safeSerialize({
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.userAgentData?.platform || navigator.platform || 'web',
    online: navigator.onLine,
    url: window.location.href,
    referrer: document.referrer || '',
    viewport: `${window.innerWidth || 0}x${window.innerHeight || 0}`,
  });
}

function normalizeInput(input, extra = {}) {
  if (input instanceof Error) {
    return { ...extra, error: input };
  }
  if (typeof input === 'string') {
    return { ...extra, message: input };
  }
  return { ...(input || {}), ...(extra || {}) };
}

function buildMessage(details) {
  if (details.message) return truncate(details.message);
  if (details.error?.message) return truncate(details.error.message);
  return 'Sin mensaje';
}

function buildFingerprint(details) {
  return truncate([
    details.kind || DEFAULT_KIND,
    details.module || inferModule(details.route),
    details.screen || '',
    details.action || '',
    details.errorName || details.error?.name || '',
    buildMessage(details),
  ].join('|'), 512);
}

function buildEvent(level, input, extra = {}) {
  const details = normalizeInput(input, extra);
  const route = details.route || currentRoute();
  const error = details.error instanceof Error ? details.error : null;
  const payload = safeSerialize(details.payload || {});
  const context = safeSerialize(details.context || {});
  const event = {
    level,
    kind: details.kind || DEFAULT_KIND,
    source: details.source || loggerState.appContext.source,
    module: details.module || inferModule(route),
    screen: details.screen || '',
    action: details.action || 'unspecified',
    route,
    status: details.status || '',
    message: buildMessage(details),
    errorName: details.errorName || error?.name || '',
    stack: error?.stack ? truncate(error.stack, 12000) : truncate(details.stack || '', 12000),
    payload,
    context,
    browser: safeSerialize({ ...browserInfo(), ...(details.browser || {}) }),
    durationMs: Number.isFinite(details.durationMs) ? Math.max(0, Math.round(details.durationMs)) : null,
    appVersion: details.appVersion || loggerState.appContext.appVersion,
    commitSha: details.commitSha || loggerState.appContext.commitSha || '',
    buildNumber: details.buildNumber || loggerState.appContext.buildNumber || '',
    correlationId: details.correlationId || loggerState.sessionId,
    sessionId: loggerState.sessionId,
    handled: details.handled !== false,
    fingerprint: details.fingerprint || buildFingerprint(details),
    user: safeSerialize(loggerState.user || {}),
    persist: details.persist ?? (level !== 'info'),
    rawError: error,
  };
  return event;
}

function writeConsole(level, event) {
  const printer = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  printer(`[${level.toUpperCase()}] ${event.module}.${event.action}`, {
    message: event.message,
    route: event.route,
    correlationId: event.correlationId,
    user: event.user,
    context: event.context,
    payload: event.payload,
    durationMs: event.durationMs,
  });
}

async function persistEvent(event) {
  const rpcPayload = {
    level: event.level,
    kind: event.kind,
    source: event.source,
    module: event.module,
    screen: event.screen,
    action: event.action,
    route: event.route,
    status: event.status,
    message: event.message,
    error_name: event.errorName,
    stack: event.stack,
    payload: event.payload,
    context: event.context,
    browser: event.browser,
    duration_ms: event.durationMs,
    app_version: event.appVersion,
    commit_sha: event.commitSha,
    build_number: event.buildNumber,
    correlation_id: event.correlationId,
    session_id: event.sessionId,
    handled: event.handled,
    fingerprint: event.fingerprint,
  };
  const { error } = await supabase.rpc('log_client_event', { p_event: rpcPayload });
  if (error) throw error;
}

async function flushQueue() {
  if (loggerState.flushing) return;
  loggerState.flushing = true;
  try {
    while (loggerState.queue.length > 0) {
      const next = loggerState.queue[0];
      try {
        await persistEvent(next);
      } catch (error) {
        console.warn('[LOGGER] persist failed', error?.message || error);
      } finally {
        loggerState.queue.shift();
      }
    }
  } finally {
    loggerState.flushing = false;
  }
}

function enqueue(event) {
  if (!event.persist) return;
  if (loggerState.queue.length >= MAX_QUEUE_SIZE) {
    loggerState.queue.shift();
  }
  loggerState.queue.push(event);
  void flushQueue();
}

function captureToSentry(event) {
  if (event.level !== 'error') return;
  sentryLogError(event.rawError || new Error(event.message), {
    module: event.module,
    screen: event.screen,
    action: event.action,
    route: event.route,
    correlationId: event.correlationId,
    payload: event.payload,
    context: event.context,
  });
}

function emit(level, input, extra = {}) {
  const event = buildEvent(level, input, extra);
  writeConsole(level, event);
  captureToSentry(event);
  enqueue(event);
  return event;
}

export function setLoggerUserContext(user) {
  if (!user) {
    loggerState.user = null;
    return;
  }
  loggerState.user = {
    id: user.id ?? null,
    email: user.email ?? '',
    nombre: user.nombre ?? '',
    rol: user.rol ?? '',
  };
}

export function clearLoggerUserContext() {
  loggerState.user = null;
}

export function setLoggerAppContext(context = {}) {
  loggerState.appContext = {
    ...loggerState.appContext,
    ...safeSerialize(context),
  };
}

export function installGlobalErrorHandlers() {
  if (loggerState.handlersInstalled || typeof window === 'undefined') return;
  loggerState.handlersInstalled = true;

  window.addEventListener('error', (event) => {
    emit('error', event.error || new Error(event.message || 'Unhandled window error'), {
      kind: 'frontend',
      module: inferModule(currentRoute()),
      screen: document.title || '',
      action: 'window.onerror',
      route: currentRoute(),
      handled: false,
      context: {
        filename: event.filename || '',
        lineno: event.lineno || null,
        colno: event.colno || null,
      },
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason instanceof Error
      ? event.reason
      : new Error(typeof event.reason === 'string' ? event.reason : 'Unhandled promise rejection');
    emit('error', reason, {
      kind: 'frontend',
      module: inferModule(currentRoute()),
      screen: document.title || '',
      action: 'window.unhandledrejection',
      route: currentRoute(),
      handled: false,
      context: {
        reason: safeSerialize(event.reason),
      },
    });
  });
}

export const Logger = {
  info(input, extra) {
    return emit('info', input, extra);
  },
  warn(input, extra) {
    return emit('warn', input, extra);
  },
  error(input, extra) {
    return emit('error', input, extra);
  },
  audit(input, extra) {
    return emit('info', input, { ...extra, kind: 'audit', persist: true });
  },
  performance(input, extra) {
    return emit('info', input, { ...extra, kind: 'performance', persist: true });
  },
  async time(label, fn, extra = {}) {
    const started = performance.now();
    try {
      const result = await fn();
      Logger.performance({
        module: extra.module,
        screen: extra.screen,
        action: extra.action || label,
        message: extra.message || label,
        durationMs: performance.now() - started,
        status: 'ok',
        payload: extra.payload,
        context: extra.context,
      });
      return result;
    } catch (error) {
      Logger.error(error, {
        module: extra.module,
        screen: extra.screen,
        action: extra.action || label,
        message: extra.errorMessage || `Fallo en ${label}`,
        durationMs: performance.now() - started,
        status: 'error',
        payload: extra.payload,
        context: extra.context,
      });
      throw error;
    }
  },
};
