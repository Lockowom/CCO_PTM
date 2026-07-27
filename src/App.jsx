import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import CommandPalette from './components/ui/CommandPalette';
import ErrorBoundary from './components/ErrorBoundary';
import SuspenseLoaderTimeout from './components/ui/SuspenseLoaderTimeout';
import { Lock, Database, MessageSquare } from 'lucide-react';
import { ROUTE_PERMISSIONS, permisosDeRuta } from './constants/permissions';
import { usePresenceTracker } from './hooks/usePresence';
import { Capacitor } from '@capacitor/core';
import { initOTAUpdates, onUpdateAvailable, applyPendingUpdate } from './services/mobileService';
import UpdateOverlay from './components/ui/UpdateOverlay';
import NovedadesModal from './components/NovedadesModal';
import AsistenteIA from './components/AsistenteIA';
import { supabase } from './supabase';
import { toast, Toaster } from 'sonner';
import { PanelIngresar, PanelInfo, PanelTV, PanelBuilder, PanelConfig } from './pages/Panel/PanelScreens';

// Login & Dashboard
const Login = React.lazy(() => import('./pages/Login'));
const VerificarCertificado = React.lazy(() => import('./pages/VerificarCertificado'));
const SolicitudPublica = React.lazy(() => import('./pages/Postventa/SolicitudPublica')); // Formulario público de servicio (sin login)
const ConsultaNV = React.lazy(() => import('./pages/Public/ConsultaNV')); // Consulta pública de N.V. (sin login)
import VersionGuard from './lib/versionGuard'; // fuerza re-login al detectar nueva versión desplegada

// Mobile — PDA Operativa de Bodega
const WarehousePDA = React.lazy(() => import('./pages/Mobile/WarehousePDA'));

// TMS (Transporte) — reconstruido desde 0
const TmsTransporte = React.lazy(() => import('./pages/TMS/Transporte'));
const TmsMiRuta = React.lazy(() => import('./pages/TMS/MiRuta'));

// Inbound Modules
const Entry = React.lazy(() => import('./pages/Inbound/Entry'));
const CubingRegistry = React.lazy(() => import('./pages/Inbound/CubingRegistry'));
const Reception = React.lazy(() => import('./pages/Inbound/Reception'));
const ReceptionNacional = React.lazy(() => import('./pages/Inbound/ReceptionNacional')); // NUEVO

// Intelligence Modules
const Batches = React.lazy(() => import('./pages/Queries/Batches'));
const SalesStatus = React.lazy(() => import('./pages/Queries/SalesStatus'));
const Addresses = React.lazy(() => import('./pages/Queries/Addresses'));
const WmsLocations = React.lazy(() => import('./pages/Queries/WmsLocations'));
const HistorialNV = React.lazy(() => import('./pages/Queries/HistorialNV'));
const Heatmap = React.lazy(() => import('./pages/Queries/Heatmap'));
const DispatchControl = React.lazy(() => import('./pages/Queries/DispatchControl'));
const ProductDatasheet = React.lazy(() => import('./pages/Queries/ProductDatasheet'));
const ConsultaGrupo = React.lazy(() => import('./pages/Queries/ConsultaGrupo'));

// Quality Modules
const MonitoreoCalidad = React.lazy(() => import('./pages/Quality/Monitoreo'));
const AccionesCalidad = React.lazy(() => import('./pages/Quality/AccionesCalidad'));
const MiBandeja = React.lazy(() => import('./pages/Quality/MiBandeja'));
const ClasificacionProductos = React.lazy(() => import('./pages/Quality/ClasificacionProductos'));

// Tools (módulos externos integrados)
const Traspasos = React.lazy(() => import('./pages/Tools/Traspasos'));
// Panel PTM nativo (port de lockowom/panel-) — estructura con datos de ejemplo
const PanelLayout = React.lazy(() => import('./pages/Panel/PanelLayout'));
const DashboardReal = React.lazy(() => import('./pages/Panel/dash/DashboardReal')); // dashboard fiel (copia del original)
const ConteoCiclico = React.lazy(() => import('./pages/Inventory/ConteoCiclico'));
const AnalisisCodigos = React.lazy(() => import('./pages/Inventory/AnalisisCodigos'));
const Carteles = React.lazy(() => import('./pages/Inventory/Carteles'));
const Insumos = React.lazy(() => import('./pages/Inventory/Insumos'));
const BloqueDetalle = React.lazy(() => import('./pages/Inventory/BloqueDetalle'));
const Postventa = React.lazy(() => import('./pages/Postventa/Postventa'));

// Admin Modules
const AccessControl = React.lazy(() => import('./pages/Admin/AccessControl')); // Usuarios y Roles unificados
const Seguridad = React.lazy(() => import('./pages/Seguridad')); // Seguridad de mi cuenta (MFA/2FA) — cualquier autenticado
const BodegasSoftland = React.lazy(() => import('./pages/Admin/BodegasSoftland'));
const Views = React.lazy(() => import('./pages/Admin/Views'));
const DataImport = React.lazy(() => import('./pages/Admin/DataImport'));
const Cleanup = React.lazy(() => import('./pages/Admin/Cleanup')); // NUEVO
const Tickets = React.lazy(() => import('./pages/Admin/Tickets'));
const UploadHistory = React.lazy(() => import('./pages/Admin/UploadHistory')); // NEW: Historial de Cargas
const LocationManager = React.lazy(() => import('./pages/Admin/LocationManager')); // Gestión Ubicaciones
const AdminMonitor = React.lazy(() => import('./pages/Admin/AdminMonitor')); // Monitor Tiempo Real
const Observability = React.lazy(() => import('./pages/Admin/Observability')); // Centro de Observabilidad
const Workflows = React.lazy(() => import('./pages/Admin/Workflows')); // Workflow Engine (procesos como datos)
const FlujoMaestro = React.lazy(() => import('./pages/Tools/FlujoMaestro')); // Mapa de Procesos (vista ejecutiva, solo lectura)
const Eventos = React.lazy(() => import('./pages/Admin/Eventos')); // Motor de Eventos + Centro de Notificaciones
const ApiKeys = React.lazy(() => import('./pages/Admin/ApiKeys')); // API de Operaciones v1 (claves)

// Fallback 404
const NotFound = React.lazy(() => import('./pages/NotFound'));


// Orden de prioridad para la primera ruta disponible
const ROUTE_PRIORITY = [
  '/panel',
  '/inbound/entry',
  '/queries/batches',
  '/queries/sales-status',
  '/queries/historial-nv',
  '/queries/dispatch-control',
  '/queries/addresses',
  '/queries/locations',
  '/admin/users',
  '/admin/roles',
  '/admin/views',
];


// Global Suspense Loader Cyber-Logístico (con escape de seguridad a los 15s)
const SuspenseLoader = () => <SuspenseLoaderTimeout />;

// Componente de Acceso Denegado
const AccessDenied = ({ requiredPermissions, route }) => {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 shadow-lg">
            <Lock size={48} className="mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-black text-slate-900 mb-2">Acceso Denegado</h1>
            <p className="text-slate-600 mb-4">No tienes permisos para acceder a esta sección.</p>

            <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6 text-left text-sm">
              <p className="font-bold text-red-900 mb-2">Ruta:</p>
              <p className="font-mono text-red-700 break-all mb-3">{route}</p>
              <p className="font-bold text-red-900 mb-2">Permisos requeridos:</p>
              <div className="space-y-1">
                {requiredPermissions.map(perm => (
                  <div key={perm} className="text-red-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    {perm}
                  </div>
                ))}
              </div>
            </div>

            <a href="/" className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors">
              Volver al inicio
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Componente que determina la primera ruta disponible para el usuario
const SmartRedirect = () => {
  const { user, hasPermission, loading, landingPage } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-slate-500 font-medium">Cargando...</div>
      </div>
    );
  }

  // 1. PRIORIDAD: Si el rol tiene una landing_page configurada y tiene acceso, ir allí.
  // Se recorta el query string (?tab=...) porque las landing de APP_ROUTES incluyen
  // deep-links de pestañas y el mapa de permisos se indexa por pathname puro.
  if (landingPage && landingPage !== '/') {
    const requiredPerms = permisosDeRuta(String(landingPage).split('?')[0]);
    const hasAccess = user?.rol === 'ADMIN' || user?.es_admin_delegado ||
      (Array.isArray(requiredPerms) && (requiredPerms.length === 0 || requiredPerms.some(perm => hasPermission(perm))));

    if (hasAccess) {
      return <Navigate to={landingPage} replace />;
    }
  }

  // 2. ADMIN tiene acceso a todo → ir al Panel PTM si no tiene landing_page específica
  if (user?.rol === 'ADMIN' || user?.es_admin_delegado) {
    return <Navigate to="/panel" replace />;
  }

  // 3. FALLBACK: buscar la primera ruta a la que tienen acceso según ROUTE_PRIORITY
  for (const route of ROUTE_PRIORITY) {
    const requiredPerms = ROUTE_PERMISSIONS[route] || [];
    if (requiredPerms.length === 0) {
      return <Navigate to={route} replace />;
    }
    const hasAccess = requiredPerms.some(perm => hasPermission(perm));
    if (hasAccess) {
      return <Navigate to={route} replace />;
    }
  }

  // Si no tiene acceso a nada, ir al Panel (mostrará acceso denegado)
  return <Navigate to="/panel" replace />;
};

// Ruta Protegida con validación de permisos + tracking de presencia
const ProtectedRoute = () => {
  const { isAuthenticated, loading, user, hasPermission } = useAuth();
  const location = useLocation();
  const { startTracking, updatePath } = usePresenceTracker();

  // Tracking de presencia: reportar módulo actual cada 30s
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      startTracking(location.pathname);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      updatePath(location.pathname);
    }
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-slate-500 font-medium">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Conservar el destino: Login vuelve aquí tras autenticarse (clave para el
    // QR de bloques /inventory/bloque/:codigo escaneado sin sesión activa).
    return <Navigate to="/login" replace state={{ from: { pathname: location.pathname, search: location.search } }} />;
  }

  // Contrato del proyecto: una ruta SIN permisos declarados se DENIEGA (antes el
  // guard hacía lo contrario: cualquier pathname no registrado —incluido
  // "/Admin/Users/" con mayúsculas o slash final, que React Router sí renderiza—
  // quedaba abierto a todo usuario autenticado). permisosDeRuta normaliza el
  // pathname y resuelve también rutas con parámetros (/inventory/bloque/:codigo).
  // La raíz "/" queda fuera: la renderiza SmartRedirect, que decide por permisos.
  const requiredPermissions = permisosDeRuta(location.pathname);
  const hasAccess = location.pathname === '/' || user?.rol === 'ADMIN' || user?.es_admin_delegado ||
    (Array.isArray(requiredPermissions) &&
      (requiredPermissions.length === 0 || requiredPermissions.some(perm => hasPermission(perm))));

  if (!hasAccess) {
    return <AccessDenied requiredPermissions={requiredPermissions || []} route={location.pathname} />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

// Error Boundary por módulo para evitar crashes globales
const ModuleBoundary = ({ children }) => (
  <ErrorBoundary>
    {children}
  </ErrorBoundary>
);

function AppContent() {
  const { user } = useAuth();
  const [pendingUpdate, setPendingUpdate] = useState(null);

  // Inicializar OTA Updates y Notificaciones Globales
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Marca la app instalada → activa el escalado fluido y el "app-feel"
      // (tap sin flash, sin rubber-band) definidos en index.css para .is-native.
      document.documentElement.classList.add('is-native');
      initOTAUpdates();
      onUpdateAvailable((info) => setPendingUpdate(info));
    }

    // --- SISTEMA DE DETECCIÓN GLOBAL DE SUBIDA DE DATOS ---
    const channel = supabase
      .channel('global-upload-detector')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tms_historial_cargas' },
        (payload) => {
          const { modulo, usuario_nombre, registros_totales, registros_error } = payload.new;
          if (user && usuario_nombre === user.nombre) return;
          toast.info(`Nueva subida: ${modulo}`, {
            description: `${usuario_nombre} cargó ${registros_totales} registros.${registros_error > 0 ? ` (${registros_error} errores)` : ''}`,
            icon: <Database className="text-orange-500" size={18} />,
            duration: 6000,
            action: { label: 'Ver Historial', onClick: () => window.location.href = '/admin/upload-history' }
          });
        }
      )
      .subscribe();

    // --- SISTEMA DE NOTIFICACIÓN GLOBAL DE TICKETS TI ---
    const ticketChannel = supabase
      .channel('global-ticket-detector')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tms_tickets' },
        (payload) => {
          const { usuario_nombre, asunto, descripcion, prioridad, ticket_id } = payload.new;
          // No notificar al creador
          if (user && usuario_nombre === user.nombre) return;

          const prioLabel = prioridad === 'ALTA' ? '🔴 ALTA' : prioridad === 'MEDIA' ? '🟡 MEDIA' : '🔵 BAJA';

          toast.warning(`🎟️ Nuevo Ticket: ${ticket_id}`, {
            description: `${usuario_nombre}: ${asunto || descripcion?.slice(0, 60) || 'Sin detalle'} — Prioridad ${prioLabel}`,
            icon: <MessageSquare className="text-indigo-500" size={18} />,
            duration: 10000,
            action: { label: 'Ver Tickets', onClick: () => window.location.href = '/admin/tickets' }
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tms_tickets' },
        (payload) => {
          const { estado, ticket_id, respuesta_admin } = payload.new;
          const oldEstado = payload.old?.estado;
          // Solo notificar cambios de estado o respuesta nueva
          if (estado !== oldEstado) {
            const statusEmoji = estado === 'RESUELTO' ? '✅' : estado === 'EN_PROCESO' ? '⚡' : '⏳';
            toast.info(`${statusEmoji} Ticket ${ticket_id} → ${estado.replace('_', ' ')}`, {
              icon: <MessageSquare className="text-indigo-500" size={18} />,
              duration: 6000,
              action: { label: 'Ver', onClick: () => window.location.href = '/admin/tickets' }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(ticketChannel);
    };
    // Solo el nombre se usa dentro de los callbacks: depender del objeto `user`
    // completo destruía y re-suscribía ambos canales en cada setUser (heartbeats,
    // session guard), con ventanas donde se perdían eventos.
  }, [user?.nombre]);

  return (
    <Router>
      {/* OTA Update Overlay — fullscreen blocker while applying */}
      <UpdateOverlay
        updateInfo={pendingUpdate}
        onApplyNow={(bundleId) => applyPendingUpdate(bundleId)}
      />
      {/* Novedades / notas del parche: aparece solo tras actualizar la versión */}
      <NovedadesModal />
      {/* Asistente IA flotante (solo autenticados con permiso view_asistente) */}
      <AsistenteIA />
      <CommandPalette />
      <VersionGuard />
      <Suspense fallback={<SuspenseLoader />}><Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/verificar" element={<VerificarCertificado />} />
        {/* Formulario público de solicitud de servicio (sin login) */}
        <Route path="/soporte" element={<ErrorBoundary><SolicitudPublica /></ErrorBoundary>} />
        {/* Consulta pública de Nota de Venta (Info N.V. sin login) */}
        <Route path="/consulta" element={<ErrorBoundary><ConsultaNV /></ErrorBoundary>} />

        {/* Protected Routes (Wrapped in ProtectedRoute) */}
        <Route path="/" element={<ProtectedRoute />}>
          {/* Smart redirect: ir a la primera ruta que el usuario puede ver */}
          <Route index element={<SmartRedirect />} />

          {/* PDA Operativa de Bodega */}
          <Route path="mobile/pda" element={<ErrorBoundary><WarehousePDA /></ErrorBoundary>} />

          {/* TMS (Transporte) */}
          <Route path="tms/control" element={<ErrorBoundary><TmsTransporte /></ErrorBoundary>} />
          <Route path="tms/pda" element={<ErrorBoundary><TmsMiRuta /></ErrorBoundary>} />

          {/* Inbound Modules */}
          <Route path="inbound/reception" element={<ErrorBoundary><Reception /></ErrorBoundary>} />
          <Route path="inbound/reception-nacional" element={<ErrorBoundary><ReceptionNacional /></ErrorBoundary>} />
          <Route path="inbound/entry" element={<ErrorBoundary><Entry /></ErrorBoundary>} />
          <Route path="inbound/cubing" element={<ErrorBoundary><CubingRegistry /></ErrorBoundary>} />
          <Route path="inbound/data-import" element={<ErrorBoundary><DataImport /></ErrorBoundary>} />

          {/* Queries Modules */}
          <Route path="queries/batches" element={<ErrorBoundary><Batches /></ErrorBoundary>} />
          <Route path="queries/sales-status" element={<ErrorBoundary><SalesStatus /></ErrorBoundary>} />
          <Route path="queries/addresses" element={<ErrorBoundary><Addresses /></ErrorBoundary>} />
          <Route path="queries/locations" element={<ErrorBoundary><WmsLocations /></ErrorBoundary>} />
          <Route path="queries/heatmap" element={<ErrorBoundary><Heatmap /></ErrorBoundary>} />
          <Route path="queries/historial-nv" element={<ErrorBoundary><HistorialNV /></ErrorBoundary>} />
          <Route path="queries/dispatch-control" element={<ErrorBoundary><DispatchControl /></ErrorBoundary>} />
          <Route path="queries/datasheet" element={<ErrorBoundary><ProductDatasheet /></ErrorBoundary>} />
          <Route path="queries/grupo" element={<ErrorBoundary><ConsultaGrupo /></ErrorBoundary>} />

          {/* Quality Modules */}
          <Route path="quality/monitoreo" element={<ErrorBoundary><MonitoreoCalidad /></ErrorBoundary>} />
          <Route path="quality/acciones" element={<ErrorBoundary><AccionesCalidad /></ErrorBoundary>} />
          <Route path="quality/bandeja" element={<ErrorBoundary><MiBandeja /></ErrorBoundary>} />
          <Route path="quality/clasificacion" element={<ErrorBoundary><ClasificacionProductos /></ErrorBoundary>} />

          {/* Post-Venta / Servicio Técnico */}
          <Route path="postventa/tickets" element={<ErrorBoundary><Postventa /></ErrorBoundary>} />

          {/* Inventario */}
          <Route path="inventory/traspasos" element={<ErrorBoundary><Traspasos /></ErrorBoundary>} />
          {/* Panel PTM nativo (estructura con datos de ejemplo) */}
          <Route path="panel" element={<ErrorBoundary><PanelLayout /></ErrorBoundary>}>
            <Route index element={<DashboardReal />} />
            <Route path="ingresar" element={<PanelIngresar />} />
            <Route path="info" element={<PanelInfo />} />
            <Route path="tv" element={<PanelTV />} />
            <Route path="builder" element={<PanelBuilder />} />
            <Route path="configuracion" element={<PanelConfig />} />
          </Route>
          <Route path="inventory/conteo" element={<ErrorBoundary><ConteoCiclico /></ErrorBoundary>} />
          <Route path="inventory/analisis" element={<ErrorBoundary><AnalisisCodigos /></ErrorBoundary>} />
          <Route path="inventory/carteles" element={<ErrorBoundary><Carteles /></ErrorBoundary>} />
          <Route path="inventory/insumos" element={<ErrorBoundary><Insumos /></ErrorBoundary>} />
          <Route path="inventory/bloque/:codigo" element={<ErrorBoundary><BloqueDetalle /></ErrorBoundary>} />

          {/* Seguridad de mi cuenta (MFA) — cualquier usuario autenticado */}
          <Route path="seguridad" element={<ErrorBoundary><Seguridad /></ErrorBoundary>} />

          {/* Admin Modules */}
          <Route path="admin/users" element={<ErrorBoundary><AccessControl /></ErrorBoundary>} />
          <Route path="admin/roles" element={<ErrorBoundary><AccessControl /></ErrorBoundary>} />
          <Route path="admin/views" element={<ErrorBoundary><Views /></ErrorBoundary>} />
          <Route path="admin/cleanup" element={<ErrorBoundary><Cleanup /></ErrorBoundary>} />
          <Route path="admin/tickets" element={<ErrorBoundary><Tickets /></ErrorBoundary>} />
          <Route path="admin/upload-history" element={<ErrorBoundary><UploadHistory /></ErrorBoundary>} />
          <Route path="admin/locations" element={<ErrorBoundary><LocationManager /></ErrorBoundary>} />
          <Route path="admin/bodegas-softland" element={<ErrorBoundary><BodegasSoftland /></ErrorBoundary>} />
          <Route path="admin/monitor" element={<ErrorBoundary><AdminMonitor /></ErrorBoundary>} />
          <Route path="admin/observability" element={<ErrorBoundary><Observability /></ErrorBoundary>} />
          <Route path="admin/workflows" element={<ErrorBoundary><Workflows /></ErrorBoundary>} />
          <Route path="admin/flujo-maestro" element={<ErrorBoundary><FlujoMaestro /></ErrorBoundary>} />
          <Route path="admin/eventos" element={<ErrorBoundary><Eventos /></ErrorBoundary>} />
          <Route path="admin/api" element={<ErrorBoundary><ApiKeys /></ErrorBoundary>} />
        </Route>

        {/* Fallback 404 en lugar de Navigate al login */}
        <Route path="*" element={<NotFound />} />
      </Routes></Suspense>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Toaster richColors position="top-right" />
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
