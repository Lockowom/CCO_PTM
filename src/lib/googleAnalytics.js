import { Logger } from './logger';

const IS_PROD = import.meta.env.PROD;
const GA_MEASUREMENT_ID = String(import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();
const GA_ENABLE_DEV = import.meta.env.VITE_GA_ENABLE_DEV === 'true';
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
const APP_BUILD_ID = typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : APP_VERSION;

let gaInitialized = false;
let gaScriptPromise = null;

function isGaEnabled() {
  return !!GA_MEASUREMENT_ID && (IS_PROD || GA_ENABLE_DEV);
}

function ensureDataLayer() {
  if (!Array.isArray(window.dataLayer)) {
    window.dataLayer = [];
  }
}

function gtag(...args) {
  ensureDataLayer();
  window.dataLayer.push(args);
}

function loadGaScript() {
  if (gaScriptPromise) return gaScriptPromise;

  gaScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[data-ga-id="${GA_MEASUREMENT_ID}"]`);
    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    script.dataset.gaId = GA_MEASUREMENT_ID;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Google Analytics'));
    document.head.appendChild(script);
  });

  return gaScriptPromise;
}

export async function initGoogleAnalytics() {
  if (
    !isGaEnabled() ||
    gaInitialized ||
    typeof window === 'undefined' ||
    typeof document === 'undefined'
  ) {
    return;
  }

  try {
    await loadGaScript();
    ensureDataLayer();
    window.gtag = gtag;
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      app_name: 'CCO PTM',
      app_version: APP_VERSION,
      debug_mode: !IS_PROD && GA_ENABLE_DEV
    });
    gaInitialized = true;
  } catch (error) {
    Logger.warn(error, {
      module: 'analytics',
      screen: 'bootstrap',
      action: 'ga_init',
      message: 'No se pudo inicializar Google Analytics',
      persist: false
    });
  }
}

export function trackPageView({ path, title, authState = 'unknown', routeArea = 'internal' } = {}) {
  if (!gaInitialized || typeof window === 'undefined' || !path) return;

  window.gtag('event', 'page_view', {
    page_title: title || document.title || 'CCO PTM',
    page_path: path,
    page_location: window.location.href,
    auth_state: authState,
    route_area: routeArea,
    build_id: APP_BUILD_ID
  });
}

export function trackGaEvent(eventName, params = {}) {
  if (!gaInitialized || typeof window === 'undefined' || !eventName) return;

  const safeEventName = String(eventName)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!safeEventName) return;

  window.gtag('event', safeEventName, {
    ...params,
    build_id: APP_BUILD_ID
  });
}

export function isGoogleAnalyticsEnabled() {
  return isGaEnabled();
}
