import * as Sentry from "@sentry/react";

const IS_PROD = import.meta.env.PROD;

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: IS_PROD ? 0.2 : 1.0,
    replaysSessionSampleRate: IS_PROD ? 0.05 : 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
};

export const logError = (error, context = {}) => {
  Sentry.captureException(error, { extra: context });
};

export const setUserForTracking = (user) => {
  if (!user) return;
  Sentry.setUser({ id: user.id, email: user.email, username: user.nombre });
};
