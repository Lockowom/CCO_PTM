// Configuración base de Sentry para React
// Importar en main.jsx o App.jsx cuando el paquete esté instalado
// import * as Sentry from "@sentry/react";

export const initSentry = () => {
  // Descomentar esto cuando se haya ejecutado: npm install @sentry/react @sentry/browser
  /*
  Sentry.init({
    dsn: "TU_DSN_DE_SENTRY_AQUI", // Reemplazar con el DSN que te da Sentry.io al crear el proyecto
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
  console.log("🛡️ Sentry inicializado en modo oculto");
  */
};

export const logError = (error, context = {}) => {
  console.error("WMS Error:", error, context);
  // Sentry.captureException(error, { extra: context });
};

export const setUserForTracking = (user) => {
  if (!user) return;
  // Sentry.setUser({ id: user.id, email: user.email, username: user.nombre });
};
