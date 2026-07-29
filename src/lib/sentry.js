import * as Sentry from '@sentry/react';

const IS_PROD = import.meta.env.PROD;
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
const APP_BUILD_ID = typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : APP_VERSION;
const DEFAULT_CCO_SENTRY_DSN =
  'https://32f4476381af053f7efa547105385fcd@o4511820255854592.ingest.us.sentry.io/4511820335022080';

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN || (IS_PROD ? DEFAULT_CCO_SENTRY_DSN : '');
  const sentryEnvironment =
    import.meta.env.VITE_SENTRY_ENVIRONMENT || (IS_PROD ? 'production' : 'development');
  const enableInDev = import.meta.env.VITE_SENTRY_ENABLE_DEV === 'true';
  if (!dsn || (!IS_PROD && !enableInDev)) return;

  Sentry.init({
    dsn,
    environment: sentryEnvironment,
    release: `cco-ptm@${APP_VERSION}+${APP_BUILD_ID}`,
    // Sin Session Replay (Ley 21.719, hallazgo S6): la grabación de sesión
    // enviaba a un tercero capturas del trabajo del empleado con datos de
    // clientes/correos visibles en pantalla. Solo tracing de performance.
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: IS_PROD ? 0.2 : 1.0,
    // Minimización: no adjuntar IP del usuario a los eventos.
    sendDefaultPii: false,
    initialScope: {
      tags: {
        app_version: APP_VERSION,
        build_id: APP_BUILD_ID,
        source: 'frontend'
      }
    }
  });
};

export const logError = (error, context = {}) => {
  Sentry.captureException(error, { extra: context });
};

export const setUserForTracking = (user) => {
  if (!user) {
    Sentry.setUser(null);
    return;
  }
  // Solo el id interno — sin email ni nombre real (minimización de PII hacia
  // el tercero; con el id un admin puede correlacionar internamente si hace falta).
  Sentry.setUser({ id: user.id });
};

export const clearUserForTracking = () => {
  Sentry.setUser(null);
};
