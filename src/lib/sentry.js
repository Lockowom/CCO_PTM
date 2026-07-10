import * as Sentry from "@sentry/react";

const IS_PROD = import.meta.env.PROD;

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    // Sin Session Replay (Ley 21.719, hallazgo S6): la grabación de sesión
    // enviaba a un tercero capturas del trabajo del empleado con datos de
    // clientes/correos visibles en pantalla. Solo tracing de performance.
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    tracesSampleRate: IS_PROD ? 0.2 : 1.0,
    // Minimización: no adjuntar IP del usuario a los eventos.
    sendDefaultPii: false,
  });
};

export const logError = (error, context = {}) => {
  Sentry.captureException(error, { extra: context });
};

export const setUserForTracking = (user) => {
  if (!user) return;
  // Solo el id interno — sin email ni nombre real (minimización de PII hacia
  // el tercero; con el id un admin puede correlacionar internamente si hace falta).
  Sentry.setUser({ id: user.id });
};
