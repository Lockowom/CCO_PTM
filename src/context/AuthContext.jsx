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
import { runtimeContext } from '../services/iamService';
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
            }
          }
        }
      } catch (err) {
        Logger.error(err, {
          module: 'auth',
          screen: 'AuthProvider',
          action: 'init_session',
          message: 'No se pudo restaurar la sesion inicial'
        });
        // Caer a la pantalla de login en vez de quedar colgado en "Cargando…".
        toast.error('No se pudo restaurar la sesión a tiempo. Inicia sesión de nuevo.');
      } finally {
        initDoneRef.current = true;
        setLoading(false);
      }
    };

    initSession();
  }, [loadUserProfile, setUserState]);

  // ── Listener de cambios de sesión auth ──
  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Solo procesar después de la inicialización
      if (!initDoneRef.current) return;

      if (event === 'SIGNED_OUT') {
        loadedEmailRef.current = null;
        setUser(null);
        clearUserForTracking();
        clearLoggerUserContext();
        setPermissions([]);
        setRoles([]);
        setIamRuntime(
          buildRuntimeAccess({ perms: [], context: { mode: 'SHADOW', overrides: [] } })
        );
        setLandingPage('/');
      } else if (event === 'SIGNED_IN' && session?.user?.email) {
        // Deduplicar: si login() ya cargó este perfil, no re-cargar.
        if (loadedEmailRef.current === session.user.email.toLowerCase()) return;
        // IMPORTANTE: NO hacer llamadas a supabase (`from`/`rpc`) directamente
        // dentro del callback de onAuthStateChange. supabase-js mantiene un
        // "auth lock" mientras corre el callback; cualquier consulta que a su
        // vez necesite ese lock se DEADLOCKEA y nunca resuelve → el timeout de
        // 10s disparaba "No se pudo cargar tu perfil" para TODOS los usuarios.
        // La solución oficial es diferir el trabajo fuera del callback.
        setTimeout(async () => {
          try {
            const profile = await withTimeout(
              loadUserProfile(session.user.email, session.user.id),
              {
                ms: 10000,
                label: 'inicio de sesión'
              }
            );
            if (profile) {
              await setUserState(profile);
            } else {
              // Perfil inexistente o desactivado: destruir también el token de
              // auth (igual que initSession); si queda en localStorage, un
              // usuario desactivado conserva un JWT utilizable contra la API.
              await supabase.auth.signOut();
            }
          } catch (err) {
            Logger.error(err, {
              module: 'auth',
              screen: 'AuthProvider',
              action: 'signed_in_profile_load',
              message: 'No se pudo cargar el perfil despues del inicio de sesion'
            });
            toast.error('No se pudo cargar tu perfil. Reintenta el ingreso.');
          }
        }, 0);
      } else if (event === 'TOKEN_REFRESHED') {
        // Token renovado automáticamente — no hacer nada
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserProfile, setUserState]);

  // ── Online/Offline + Heartbeat ──
  useEffect(() => {
    if (!user?.id) return;

    const handleOffline = () => {
      wmsToast.systemOffline();
    };

    const handleOnline = async () => {
      wmsToast.systemOnline();
      await syncOfflineData();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    const updateHeartbeat = async () => {
      if (!navigator.onLine || document.visibilityState === 'hidden') return;

      try {
        const {
          data: { session }
        } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        await supabase.from('tms_usuarios_activos').upsert(
          {
            usuario_id: user.id,
            nombre: user.nombre,
            rol: user.rol,
            ultima_actividad: new Date().toISOString(),
            // Leer la URL real en el momento del latido: pathnameRef solo se
            // actualizaba con popstate y React Router navega con pushState,
            // así que el módulo reportado quedaba congelado en el de entrada.
            modulo_actual: window.location.pathname,
            estado: 'ONLINE'
          },
          { onConflict: 'usuario_id' }
        );
      } catch (_) {
        Logger.warn(_, {
          kind: 'presence',
          module: 'auth',
          screen: 'AuthProvider',
          action: 'heartbeat_update',
          message: 'Fallo el heartbeat de presencia del usuario',
          persist: false
        });
      }
    };

    updateHeartbeat();
    const interval = setInterval(updateHeartbeat, 90000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [user?.id]);

  // ── LOGIN (Supabase Auth con fallback legacy) ──
  const login = async (email, password) => {
    setLoading(true);
    setError('');

    try {
      // 1. Intentar login con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password
      });

      if (!authError && authData?.session) {
        // Login exitoso con Supabase Auth
        const profile = await loadUserProfile(email, authData.session.user.id);

        if (!profile) {
          setError('Usuario no encontrado o desactivado');
          await supabase.auth.signOut();
          setLoading(false);
          return false;
        }

        if (!profile.activo) {
          setError('Usuario desactivado');
          await supabase.auth.signOut();
          setLoading(false);
          return false;
        }

        // Asegurar que auth_uid está vinculado
        if (!profile.auth_uid) {
          await supabase
            .from('tms_usuarios')
            .update({ auth_uid: authData.session.user.id })
            .eq('id', profile.id);
        }

        await setUserState(profile);

        // Registrar acceso
        void (async () => {
          try {
            const {
              data: { session }
            } = await supabase.auth.getSession();
            if (!session?.access_token) return;
            await supabase.from('tms_accesos').insert({
              usuario_id: profile.id,
              nombre: profile.nombre,
              email: profile.email,
              rol: profile.rol
            });
          } catch (_) {
            Logger.warn(_, {
              kind: 'audit',
              module: 'auth',
              screen: 'AuthProvider',
              action: 'login_tracking',
              message: 'No se pudo registrar el acceso del usuario'
            });
          }
        })();

        setLoading(false);
        return true;
      }

      // Sin sesión de Supabase Auth → credenciales inválidas.
      // (El fallback legacy `verify_user_password` se eliminó: todos los usuarios
      //  están migrados a Supabase Auth.)
      setError('Usuario o contraseña inválidos');
      setLoading(false);
      return false;
    } catch (err) {
      Logger.error(err, {
        module: 'auth',
        screen: 'AuthProvider',
        action: 'login',
        message: 'Error del sistema durante login',
        payload: { email: email?.toLowerCase?.() || '' }
      });
      setError('Error en el sistema');
      setLoading(false);
      return false;
    }
  };

  // ── LOGOUT ──
  const logout = useCallback(async () => {
    const userId = user?.id;

    loadedEmailRef.current = null;
    setUser(null);
    clearUserForTracking();
    clearLoggerUserContext();
    setPermissions([]);
    setRoles([]);
    setIamRuntime(buildRuntimeAccess({ perms: [], context: { mode: 'SHADOW', overrides: [] } }));
    localStorage.removeItem('currentUser'); // Limpiar legacy

    // Limpieza que REQUIERE el token (debe correr ANTES de signOut, que lo destruye):
    // presencia en Admin Monitor y push token del dispositivo (en PDA compartida,
    // el siguiente usuario no debe recibir las notificaciones del anterior).
    if (userId) {
      try {
        await Promise.allSettled([
          supabase.from('tms_usuarios_activos').delete().eq('usuario_id', userId),
          supabase.from('tms_usuarios').update({ push_token: null }).eq('id', userId)
        ]);
      } catch (_) {
        /* best-effort */
      }
    }

    // Estado local persistido de otros usuarios en el mismo equipo:
    // sesión de picking (zustand persist) y cachés del service worker con
    // respuestas autenticadas de Supabase.
    try {
      const { usePickingStore } = await import('../stores/pickingStore');
      usePickingStore.getState().endSession();
      localStorage.removeItem('picking-session');
    } catch (_) {
      /* best-effort */
    }
    // Datos operativos del turno en un PDA compartido: cola de recepción,
    // estado de patios y cachés offline de Dexie (se conserva la cola de
    // sincronización pendiente para no perder trabajo sin subir).
    try {
      localStorage.removeItem('wms_entry_queue');
      Object.keys(localStorage)
        .filter((k) => k.startsWith('yard_'))
        .forEach((k) => localStorage.removeItem(k));
    } catch (_) {
      /* best-effort */
    }
    try {
      await Promise.allSettled([db.cachedProducts.clear(), db.cachedLocations.clear()]);
    } catch (_) {
      /* best-effort */
    }
    try {
      if (typeof caches !== 'undefined') {
        const keys = await caches.keys();
        await Promise.allSettled(
          keys.filter((k) => k.includes('supabase')).map((k) => caches.delete(k))
        );
      }
    } catch (_) {
      /* best-effort */
    }

    // Cerrar sesión Supabase Auth
    try {
      await supabase.auth.signOut();
    } catch (_) {
      Logger.warn(_, {
        module: 'auth',
        screen: 'AuthProvider',
        action: 'logout',
        message: 'Fallo el cierre de sesion en Supabase Auth'
      });
    }
  }, [user?.id]);

  // ── Session Guard (realtime) ──
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`session_guard_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tms_usuarios',
          filter: `id=eq.${user.id}`
        },
        async (payload) => {
          if (payload.eventType === 'DELETE') {
            alert('Tu cuenta ha sido eliminada por un administrador.');
            logout();
          } else if (payload.eventType === 'UPDATE') {
            const newUser = payload.new;

            // Cierre forzado por un administrador (revoca sesión sin desactivar).
            const flAt = newUser.force_logout_at ? new Date(newUser.force_logout_at).getTime() : 0;
            if (flAt && flAt > (sessionStartRef.current || 0)) {
              alert('Tu sesión ha sido cerrada por un administrador.');
              logout();
            } else if (newUser.activo === false) {
              alert('Tu sesión ha sido cerrada por un administrador.');
              logout();
            } else {
              const rolCambio = newUser.rol && newUser.rol !== user.rol;
              // También aplicar en caliente la concesión/revocación de admin
              // delegado: antes solo se reaccionaba al cambio de rol y un
              // delegado revocado conservaba acceso total hasta recargar.
              const delegadoCambio =
                newUser.es_admin_delegado !== undefined &&
                newUser.es_admin_delegado !== user.es_admin_delegado;
              if (rolCambio || delegadoCambio) {
                const updatedUser = {
                  ...user,
                  rol: newUser.rol || user.rol,
                  nombre: newUser.nombre !== undefined ? newUser.nombre : user.nombre,
                  email: newUser.email !== undefined ? newUser.email : user.email,
                  activo: newUser.activo !== undefined ? newUser.activo : user.activo,
                  es_admin_delegado:
                    newUser.es_admin_delegado !== undefined
                      ? newUser.es_admin_delegado
                      : user.es_admin_delegado
                };
                // Cargar primero el rol nuevo evita un render transitorio con el
                // usuario actualizado y los permisos del rol anterior.
                if (rolCambio) await loadRoleConfig(newUser.rol);
                setUser(updatedUser);
                if (rolCambio || delegadoCambio) window.location.replace('/');
              }
            }
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          Logger.warn(err, {
            kind: 'realtime',
            module: 'auth',
            screen: 'AuthProvider',
            action: 'session_guard_subscribe',
            message: 'Fallo la suscripcion realtime del guard de sesion'
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, user?.rol, user?.es_admin_delegado, logout, loadRoleConfig]);

  // ── Permisos ──
  // El admin delegado equivale a ADMIN: el guard de rutas ya le concede todo,
  // pero los botones internos y el Navbar consultan hasPermission — sin esta
  // línea el delegado tenía acceso por URL y una UI llena de acciones denegadas.
  const hasPermission = useCallback(
    (permissionId) => {
      if (user?.rol === 'ADMIN' || user?.es_admin_delegado === true) return true;
      return permissions.includes(permissionId);
    },
    [permissions, user?.rol, user?.es_admin_delegado]
  );

  const isAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado === true;

  const canAccessRoute = useCallback(
    (pathname) => {
      const legacyDecision = legacyPuedeAccederRuta(pathname, user, hasPermission, roles);
      return runtimeAllowsPath(iamRuntime, pathname, legacyDecision, isAdmin);
    },
    [hasPermission, iamRuntime, isAdmin, roles, user]
  );

  const hasScreenAccess = useCallback(
    (screenId, legacyDecision = false) =>
      runtimeAllowsScreen(iamRuntime, screenId, legacyDecision, isAdmin),
    [iamRuntime, isAdmin]
  );

  const hasFunctionAccess = useCallback(
    (functionId, legacyPermissions = []) => {
      const required = Array.isArray(legacyPermissions) ? legacyPermissions : [legacyPermissions];
      const legacyDecision =
        typeof legacyPermissions === 'boolean'
          ? legacyPermissions
          : required.length > 0 && required.some((perm) => hasPermission(perm));
      return runtimeAllowsFunction(iamRuntime, functionId, { legacyDecision, isAdmin });
    },
    [hasPermission, iamRuntime, isAdmin]
  );

  const accessDecisionForRoute = useCallback(
    (pathname) => runtimeDecisionDetails(iamRuntime, pathname),
    [iamRuntime]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        roles,
        landingPage,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
        hasPermission,
        hasScreenAccess,
        hasFunctionAccess,
        canAccessRoute,
        accessDecisionForRoute,
        iamRuntime,
        refreshPermissions
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
