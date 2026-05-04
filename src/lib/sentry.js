import * as Sentry from "@sentry/react";

export const initSentry = () => {
  // Sentry está instalado operativamente
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || "", // Usará variable de entorno o fallará silenciosamente sin DSN
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Tracing
    tracesSampleRate: 1.0, // Captura el 100% de las transacciones (bajar en producción)
    // Session Replay
    replaysSessionSampleRate: 0.1, // Graba el 10% de las sesiones de los usuarios
    replaysOnErrorSampleRate: 1.0, // Graba el 100% de las sesiones que tienen un error
  });
  console.log("🛡️ Sentry inicializado y operativo");
};

export const logError = (error, context = {}) => {
  console.error("WMS Error:", error, context);
  Sentry.captureException(error, { extra: context });
};

export const setUserForTracking = (user) => {
  if (!user) return;
  Sentry.setUser({ id: user.id, email: user.email, username: user.nombre });
};
