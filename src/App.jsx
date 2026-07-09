import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import CommandPalette from './components/ui/CommandPalette';
import ErrorBoundary from './components/ErrorBoundary';
import SuspenseLoaderTimeout from './components/ui/SuspenseLoaderTimeout';
import { Lock, Database, MessageSquare } from 'lucide-react';
import { ROUTE_PERMISSIONS } from './constants/permissions';
import { usePresenceTracker } from './hooks/usePresence';
import { Capacitor } from '@capacitor/core';
import { initOTAUpdates, onUpdateAvailable, applyPendingUpdate } from './services/mobileService';
import UpdateOverlay from './components/ui/UpdateOverlay';
import { supabase } from './supabase';
import { toast, Toaster } from 'sonner';

// Login & Dashboard
const Login = React.lazy(() => import('./pages/Login'));
const VerificarCertificado = React.lazy(() => import('./pages/VerificarCertificado'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

// TMS Modules
const RoutePlanning = React.lazy(() => import('./pages/TMS/RoutePlanning'));
const DashboardTMS = React.lazy(() => import('./pages/TMS/Dashboard'));
const Drivers = React.lazy(() => import('./pages/TMS/Drivers'));
const ControlTower = React.lazy(() => import('./pages/TMS/ControlTower'));
const MobileApp = React.lazy(() => import('./pages/TMS/MobileApp'));
const YardManagement = React.lazy(() => import('./pages/TMS/YardManagement')); // NUEVO
const CostosTransporte = React.lazy(() => import('./pages/TMS/CostosTransporte')); // NUEVO
const WarehousePDA = React.lazy(() => import('./pages/Mobile/WarehousePDA')); // NUEVO

// Inbound Modules
const Entry = React.lazy(() => import('./pages/Inbound/Entry'));
const CubingRegistry = React.lazy(() => import('./pages/Inbound/CubingRegistry'));
const Reception = React.lazy(() => import('./pages/Inbound/Reception'));
const ReceptionNacional = React.lazy(() => import('./pages/Inbound/ReceptionNacional')); // NUEVO

// Outbound Modules
const SalesOrders = React.lazy(() => import('./pages/Outbound/SalesOrders'));
const Picking = React.lazy(() => import('./pages/Outbound/Picking'));
const Packing = React.lazy(() => import('./pages/Outbound/Packing'));
const PackingTV = React.lazy(() => import('./pages/Outbound/PackingTV')); // NUEVO
const Shipping = React.lazy(() => import('./pages/Outbound/Shipping'));

// Intelligence Modules
const Batches = React.lazy(() => import('./pages/Queries/Batches'));
const SalesStatus = React.lazy(() => import('./pages/Queries/SalesStatus'));
const Addresses = React.lazy(() => import('./pages/Queries/Addresses'));
const WmsLocations = React.lazy(() => import('./pages/Queries/WmsLocations'));
const HistorialNV = React.lazy(() => import('./pages/Queries/HistorialNV'));
const Heatmap = React.lazy(() => import('./pages/Queries/Heatmap'));
const DispatchControl = React.lazy(() => import('./pages/Queries/DispatchControl'));
const ProductDatasheet = React.lazy(() => import('./pages/Queries/ProductDatasheet'));

// Quality Modules
const MonitoreoCalidad = React.lazy(() => import('./pages/Quality/Monitoreo'));
const AccionesCalidad = React.lazy(() => import('./pages/Quality/AccionesCalidad'));
const MiBandeja = React.lazy(() => import('./pages/Quality/MiBandeja'));

// Tools (módulos externos integrados)
const Traspasos = React.lazy(() => import('./pages/Tools/Traspasos'));

// Admin Modules
const Users = React.lazy(() => import('./pages/Admin/Users'));
const BodegasSoftland = React.lazy(() => import('./pages/Admin/BodegasSoftland'));
const Roles = React.lazy(() => import('./pages/Admin/Roles'));
const Views = React.lazy(() => import('./pages/Admin/Views'));
const DataImport = React.lazy(() => import('./pages/Admin/DataImport'));
const Cleanup = React.lazy(() => import('./pages/Admin/Cleanup')); // NUEVO
const Tickets = React.lazy(() => import('./pages/Admin/Tickets'));
const UploadHistory = React.lazy(() => import('./pages/Admin/UploadHistory')); // NEW: Historial de Cargas
const LocationManager = React.lazy(() => import('./pages/Admin/LocationManager')); // Gestión Ubicaciones
const AdminMonitor = React.lazy(() => import('./pages/Admin/AdminMonitor')); // Monitor Tiempo Real

// Fallback 404
const NotFound = React.lazy(() => import('./pages/NotFound'));


// Orden de prioridad para la primera ruta disponible
const ROUTE_PRIORITY = [
  '/dashboard',
  '/outbound/sales-orders',
  '/outbound/picking',
  '/outbound/packing',
  '/outbound/shipping',
  '/inbound/entry',
  '/queries/batches',
  '/queries/sales-status',
  '/queries/historial-nv',
  '/queries/dispatch-control',
  '/queries/addresses',
  '/queries/locations',
  '/tms/dashboard',
  '/tms/planning',
  '/tms/control-tower',
  '/tms/drivers',
  '/tms/mobile',
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

  // 1. PRIORIDAD: Si el rol tiene una landing_page configurada y tiene acceso, ir allí
  if (landingPage && landingPage !== '/') {
    const requiredPerms = ROUTE_PERMISSIONS[landingPage] || [];
    const hasAccess = user?.rol === 'ADMIN' || requiredPerms.length === 0 || requiredPerms.some(perm => hasPermission(perm));
    
    if (hasAccess) {
      return <Navigate to={landingPage} replace />;
    }
  }

  // 2. ADMIN tiene acceso a todo → ir al dashboard si no tiene landing_page específica
  if (user?.rol === 'ADMIN' || user?.es_admin_delegado) {
    return <Navigate to="/dashboard" replace />;
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

  // Si no tiene acceso a nada, ir al dashboard (mostrará acceso denegado)
  return <Navigate to="/dashboard" replace />;
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
    return <Navigate to="/login" replace />;
  }

  const requiredPermissions = ROUTE_PERMISSIONS[location.pathname] || [];
  const hasAccess = user?.rol === 'ADMIN' || user?.es_admin_delegado || requiredPermissions.length === 0 ||
    requiredPermissions.some(perm => hasPermission(perm));

  if (!hasAccess) {
    return <AccessDenied requiredPermissions={requiredPermissions} route={location.pathname} />;
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
  }, [user]);

  return (
    <Router>
      {/* OTA Update Overlay — fullscreen blocker while applying */}
      <UpdateOverlay
        updateInfo={pendingUpdate}
        onApplyNow={(bundleId) => applyPendingUpdate(bundleId)}
      />
      <CommandPalette />
      <Suspense fallback={<SuspenseLoader />}><Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/verificar" element={<VerificarCertificado />} />

        {/* Protected Routes (Wrapped in ProtectedRoute) */}
        <Route path="/" element={<ProtectedRoute />}>
          {/* Smart redirect: ir a la primera ruta que el usuario puede ver */}
          <Route index element={<SmartRedirect />} />
          <Route path="dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />

          {/* TMS Modules */}
          <Route path="tms/dashboard" element={<ErrorBoundary><DashboardTMS /></ErrorBoundary>} />
          <Route path="tms/planning" element={<ErrorBoundary><RoutePlanning /></ErrorBoundary>} />
          <Route path="tms/control-tower" element={<ErrorBoundary><ControlTower /></ErrorBoundary>} />
          <Route path="tms/drivers" element={<ErrorBoundary><Drivers /></ErrorBoundary>} />
          <Route path="tms/mobile" element={<ErrorBoundary><MobileApp /></ErrorBoundary>} />
          <Route path="tms/yard" element={<ErrorBoundary><YardManagement /></ErrorBoundary>} />
          <Route path="tms/costos" element={<ErrorBoundary><CostosTransporte /></ErrorBoundary>} />
          <Route path="mobile/pda" element={<ErrorBoundary><WarehousePDA /></ErrorBoundary>} />

          {/* Inbound Modules */}
          <Route path="inbound/reception" element={<ErrorBoundary><Reception /></ErrorBoundary>} />
          <Route path="inbound/reception-nacional" element={<ErrorBoundary><ReceptionNacional /></ErrorBoundary>} />
          <Route path="inbound/entry" element={<ErrorBoundary><Entry /></ErrorBoundary>} />
          <Route path="inbound/cubing" element={<ErrorBoundary><CubingRegistry /></ErrorBoundary>} />
          <Route path="inbound/data-import" element={<ErrorBoundary><DataImport /></ErrorBoundary>} />

          {/* Outbound Modules */}
          <Route path="outbound/sales-orders" element={<ErrorBoundary><SalesOrders /></ErrorBoundary>} />
          <Route path="outbound/picking" element={<ErrorBoundary><Picking /></ErrorBoundary>} />
          <Route path="outbound/packing" element={<ErrorBoundary><Packing /></ErrorBoundary>} />
          <Route path="outbound/packing-tv" element={<ErrorBoundary><PackingTV /></ErrorBoundary>} />
          <Route path="outbound/shipping" element={<ErrorBoundary><Shipping /></ErrorBoundary>} />

          {/* Queries Modules */}
          <Route path="queries/batches" element={<ErrorBoundary><Batches /></ErrorBoundary>} />
          <Route path="queries/sales-status" element={<ErrorBoundary><SalesStatus /></ErrorBoundary>} />
          <Route path="queries/addresses" element={<ErrorBoundary><Addresses /></ErrorBoundary>} />
          <Route path="queries/locations" element={<ErrorBoundary><WmsLocations /></ErrorBoundary>} />
          <Route path="queries/heatmap" element={<ErrorBoundary><Heatmap /></ErrorBoundary>} />
          <Route path="queries/historial-nv" element={<ErrorBoundary><HistorialNV /></ErrorBoundary>} />
          <Route path="queries/dispatch-control" element={<ErrorBoundary><DispatchControl /></ErrorBoundary>} />
          <Route path="queries/datasheet" element={<ErrorBoundary><ProductDatasheet /></ErrorBoundary>} />

          {/* Quality Modules */}
          <Route path="quality/monitoreo" element={<ErrorBoundary><MonitoreoCalidad /></ErrorBoundary>} />
          <Route path="quality/acciones" element={<ErrorBoundary><AccionesCalidad /></ErrorBoundary>} />
          <Route path="quality/bandeja" element={<ErrorBoundary><MiBandeja /></ErrorBoundary>} />

          {/* Tools */}
          <Route path="tools/traspasos" element={<ErrorBoundary><Traspasos /></ErrorBoundary>} />

          {/* Admin Modules */}
          <Route path="admin/users" element={<ErrorBoundary><Users /></ErrorBoundary>} />
          <Route path="admin/roles" element={<ErrorBoundary><Roles /></ErrorBoundary>} />
          <Route path="admin/views" element={<ErrorBoundary><Views /></ErrorBoundary>} />
          <Route path="admin/cleanup" element={<ErrorBoundary><Cleanup /></ErrorBoundary>} />
          <Route path="admin/tickets" element={<ErrorBoundary><Tickets /></ErrorBoundary>} />
          <Route path="admin/upload-history" element={<ErrorBoundary><UploadHistory /></ErrorBoundary>} />
          <Route path="admin/locations" element={<ErrorBoundary><LocationManager /></ErrorBoundary>} />
          <Route path="admin/bodegas-softland" element={<ErrorBoundary><BodegasSoftland /></ErrorBoundary>} />
          <Route path="admin/monitor" element={<ErrorBoundary><AdminMonitor /></ErrorBoundary>} />
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
