import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { wmsToast } from '../lib/notifications';
import { syncOfflineData } from '../lib/syncManager';
import { Capacitor } from '@capacitor/core';
import { initPushNotifications } from '../services/mobileService';
import { clearUserForTracking, setUserForTracking } from '../lib/sentry';
import { withTimeout } from '../lib/supabaseQuery';
import { toast } from 'sonner';
import { clearLoggerUserContext, Logger, setLoggerUserContext } from '../lib/logger';
import { db } from '../lib/db';
import { invalidateRuntimeContextCache, runtimeContext } from '../services/iamService';
import {
  buildRuntimeAccess,
  runtimeAllowsFunction,
  runtimeAllowsPath,
  runtimeAllowsScreen,
  runtimeDecisionDetails
} from '../domain/access/runtimeAccess.js';
import { puedeAccederRuta as legacyPuedeAccederRuta } from '../constants/permissions';

const AuthContext = createContext();
const PROFILE_SELECT = 'id, nombre, email, rol, activo, es_admin_delegado, auth_uid';
const PROFILE_CACHE_TTL_MS = 30 * 1000;
const profileCache = new Map();

function getProfileCache(email) {
  const key = String(email || '')
    .trim()
    .toLowerCase();
  if (!key) return null;
  const entry = profileCache.get(key);
  if (!entry) return null;
  if (entry.promise) return entry.promise;
  if (
    Object.prototype.hasOwnProperty.call(entry, 'value') &&
    Date.now() - entry.ts < PROFILE_CACHE_TTL_MS
  ) {
    return entry.value;
  }
  profileCache.delete(key);
  return null;
}

function setProfileCacheValue(email, value) {
  const key = String(email || '')
    .trim()
    .toLowerCase();
  if (!key) return value;
  profileCache.set(key, { ts: Date.now(), value });
  return value;
}

function setProfileCachePromise(email, promise) {
  const key = String(email || '')
    .trim()
    .toLowerCase();
  if (!key) return promise;
  profileCache.set(key, { ts: Date.now(), promise });
  return promise;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [iamRuntime, setIamRuntime] = useState(() =>
    buildRuntimeAccess({ perms: [], context: { mode: 'SHADOW', overrides: [] } })
  );
  const [landingPage, setLandingPage] = useState('/');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const initDoneRef = useRef(false);
  // Momento en que se estableció esta sesión — para distinguir un force_logout
  // POSTERIOR (admin forzó el cierre) de valores viejos de la columna.
  const sessionStartRef = useRef(0);
  // Email del perfil ya cargado, para deduplicar la carga: login() llama a
  // setUserState y además dispara SIGNED_IN, que volvería a cargar el mismo
  // perfil (doble carga de rol + doble init push). Con esto SIGNED_IN se salta
  // si el usuario ya está cargado.
  const loadedEmailRef = useRef(null);

  // ── Cargar configuración de rol (permisos + landing) ──
  // Fuente AUTORITATIVA de permisos: el IAM (`iam_me()` → permisos efectivos),
  // que en el servidor es un espejo vivo de `tms_roles.permisos_json` (Fase 1,
  // migración 122). Se combina en UNIÓN con el `permisos_json` legado como RED
  // DE SEGURIDAD — igual que el gate `usuario_tiene_algun_permiso` (IAM ∨ legado)
  // → el cliente NUNCA muestra menos permisos que hoy, cero bloqueos. El
  // `landing_page` sigue viniendo de `tms_roles` (el IAM no lo maneja aún).
  const loadRoleConfig = useCallback(async (rolId) => {
    if (!rolId) {
      setPermissions([]);
      setRoles([]);
      setIamRuntime(buildRuntimeAccess({ perms: [], context: { mode: 'SHADOW', overrides: [] } }));
      setLandingPage('/');
      return { permissions: [], landingPage: '/' };
    }

    // 1) Legado + landing desde tms_roles (respaldo garantizado).
    let legacyPerms = [];
    let landing = '/';
    try {
      const { data } = await supabase
        .from('tms_roles')
        .select('permisos_json, landing_page')
        .eq('id', rolId)
        .single();
      legacyPerms = Array.isArray(data?.permisos_json) ? data.permisos_json : [];
      landing = data?.landing_page || '/';
    } catch {
      /* respaldo vacío; el IAM puede cubrir */
    }

    // 2) IAM efectivo (autoritativo). Si falla, se usa solo el legado.
    let iamPerms = null;
    let iamRoles = null;
    try {
      const { data: me, error: meErr } = await supabase.rpc('iam_me');
      if (!meErr && me && Array.isArray(me.permisos)) {
        iamPerms = me.permisos;
        if (Array.isArray(me.roles) && me.roles.length) iamRoles = me.roles;
      }
    } catch {
      /* usa respaldo legado */
    }

    // Unión IAM ∨ legado (idéntico al gate del servidor).
    const perms = iamPerms ? Array.from(new Set([...iamPerms, ...legacyPerms])) : legacyPerms;

    setPermissions(perms);
    setRoles(iamRoles ?? [rolId]);
    setLandingPage(landing);
    // El runtime es fail-safe: si la migración aún no está publicada o la red
    // falla, queda en SHADOW y la aplicación conserva exactamente el guard legacy.
    let runtime = { mode: 'SHADOW', permission_version: 1, overrides: [] };
    try {
      runtime = await runtimeContext();
    } catch {
      /* compatibilidad durante rollout */
    }
    const nextRuntime = buildRuntimeAccess({ perms, context: runtime });
    setIamRuntime(nextRuntime);
    return { permissions: perms, landingPage: landing, iamRuntime: nextRuntime };
  }, []);

  const refreshPermissions = useCallback(async () => {
    if (user?.rol) {
      invalidateRuntimeContextCache();
      return await loadRoleConfig(user.rol);
    }
    return null;
  }, [user?.rol, loadRoleConfig]);

  // Los cambios IAM aplican sin cerrar sesión. El foco acelera la propagación y
  // el sondeo cubre navegadores/PDA donde Realtime puede quedar suspendido.
  useEffect(() => {
    if (!user?.rol) return undefined;
    const refresh = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        void loadRoleConfig(user.rol);
      }
    };
    const interval = window.setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
    };
  }, [loadRoleConfig, user?.rol]);

  // ── Suscripción global a cambios de roles ──
  useEffect(() => {
    if (!user?.rol) return;

    const channel = supabase
      .channel('roles_changes_global')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tms_roles' },
        async (payload) => {
          const changedRoleId = payload.new?.id || payload.old?.id;

          if (changedRoleId === user.rol || !changedRoleId) {
            invalidateRuntimeContextCache();
            await loadRoleConfig(user.rol);
            window.location.replace('/');
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          Logger.warn(err, {
            kind: 'realtime',
            module: 'auth',
            screen: 'AuthProvider',
            action: 'roles_realtime_subscribe',
            message: 'Fallo la suscripcion realtime de roles'
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.rol, loadRoleConfig]);

  // ── Cargar perfil desde tms_usuarios usando email de sesión auth ──
  const loadUserProfile = useCallback(async (authEmail, authUid = null) => {
    try {
      const safeEmail = String(authEmail || '')
        .trim()
        .toLowerCase();
      if (!safeEmail) return null;

      const cached = getProfileCache(safeEmail);
      if (cached) {
        return cached;
      }

      const run = async () => {
        let data = null;
        let error = null;

        if (authUid) {
          ({ data, error } = await withTimeout(
            supabase
              .from('tms_usuarios')
              .select(PROFILE_SELECT)
              .eq('auth_uid', authUid)
              .eq('activo', true)
              .limit(1),
            { ms: 4000, label: 'perfil por auth_uid' }
          ));
          if (error) throw error;
        }

        if (!data || !data.length) {
          ({ data, error } = await withTimeout(
            supabase
              .from('tms_usuarios')
              .select(PROFILE_SELECT)
              .eq('email', safeEmail)
              .eq('activo', true)
              .limit(1),
            { ms: 4000, label: 'perfil por email' }
          ));
          if (error) throw error;
        }

        if ((!data || !data.length) && safeEmail) {
          ({ data, error } = await withTimeout(
            supabase
              .from('tms_usuarios')
              .select(PROFILE_SELECT)
              .ilike('email', safeEmail)
              .eq('activo', true)
              .limit(1),
            { ms: 4000, label: 'perfil por email fallback' }
          ));
          if (error) throw error;
        }

        const result = setProfileCacheValue(safeEmail, (data && data[0]) || null);
        return result;
      };

      const promise = run().catch((err) => {
        profileCache.delete(safeEmail);
        throw err;
      });
      return setProfileCachePromise(safeEmail, promise);
    } catch (err) {
      Logger.error(err, {
        module: 'auth',
        screen: 'AuthProvider',
        action: 'load_user_profile',
        message: 'Error cargando perfil de usuario',
        payload: { authEmail, authUid }
      });
      return null;
    }
  }, []);

  // ── Establecer usuario en el estado ──
  const setUserState = useCallback(
    async (profile) => {
      if (!profile) return;

      const userData = {
        id: profile.id,
        auth_uid: profile.auth_uid,
        nombre: profile.nombre,
        email: profile.email,
        rol: profile.rol,
        activo: profile.activo,
        es_admin_delegado: profile.es_admin_delegado || false
      };

      // Cargar permisos antes de publicar el usuario autenticado. Así el router
      // nunca alcanza a evaluar una ruta con el usuario nuevo y permisos vacíos.
      // Un cambio de identidad nunca puede reutilizar el runtime IAM del usuario anterior.
      invalidateRuntimeContextCache();
      await loadRoleConfig(userData.rol);
      loadedEmailRef.current = (userData.email || '').toLowerCase();
      sessionStartRef.current = Date.now();
      setUser(userData);
      setUserForTracking(userData);
      setLoggerUserContext(userData);

      if (Capacitor.isNativePlatform()) {
        initPushNotifications(userData.id);
      }
    },
    [loadRoleConfig]
  );

  // ── Restaurar sesión al iniciar (Supabase Auth) ──
  useEffect(() => {
    const initSession = async () => {
      try {
        // Timeout (10s): si getSession() o la carga de perfil se cuelga (auth-lock
        // en WebView, red caída), el `await` nunca resolvería y la pantalla global
        // "Cargando…" quedaría infinita. Con el timeout el `finally` siempre corre.
        const {
          data: { session }
        } = await withTimeout(supabase.auth.getSession(), { ms: 10000, label: 'inicio de sesión' });

        if (session?.user?.email) {
          const profile = await withTimeout(loadUserProfile(session.user.email, session.user.id), {
            ms: 10000,
            label: 'inicio de sesión'
          });
          if (profile) {
            await setUserState(profile);
          } else {
            // Usuario existe en auth pero no en tms_usuarios (o desactivado)
            await supabase.auth.signOut();
          }
        } else {
          // Sin sesión auth — verificar si hay sesión legacy en localStorage
          const stored = localStorage.getItem('currentUser');
          if (stored) {
            try {
              JSON.parse(stored);
              // Intentar login automático con Supabase Auth no es posible sin contraseña
              // Forzar re-login
              Logger.warn('[Auth] Sesion legacy encontrada, requiere re-login con Supabase Auth', {
                module: 'auth',
                screen: 'AuthProvider',
                action: 'legacy_session_detected',
                message: 'Sesion legacy detectada y removida del almacenamiento local'
              });
              localStorage.removeItem('currentUser');
            } catch (_) {
              localStorage.removeItem('currentUser');