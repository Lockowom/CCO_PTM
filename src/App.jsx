import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import CommandPalette from './components/ui/CommandPalette';
import Placeholder from './components/Placeholder';
import ErrorBoundary from './components/ErrorBoundary';
import { Lock, Bell, Database } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { initOTAUpdates } from './services/mobileService';
import { supabase } from './supabase';
import { toast, Toaster } from 'sonner';

// Login & Dashboard
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

// TMS Modules
const RoutePlanning = React.lazy(() => import('./pages/TMS/RoutePlanning'));
const DashboardTMS = React.lazy(() => import('./pages/TMS/Dashboard'));
const Drivers = React.lazy(() => import('./pages/TMS/Drivers'));
const ControlTower = React.lazy(() => import('./pages/TMS/ControlTower'));
const MobileApp = React.lazy(() => import('./pages/TMS/MobileApp'));
const YardManagement = React.lazy(() => import('./pages/TMS/YardManagement')); // NUEVO
const WarehousePDA = React.lazy(() => import('./pages/Mobile/WarehousePDA')); // NUEVO

// Inbound Modules
const Entry = React.lazy(() => import('./pages/Inbound/Entry'));
const CubingRegistry = React.lazy(() => import('./pages/Inbound/CubingRegistry')); // NUEVO - Registro Cubicaje

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

// Admin Modules
const Users = React.lazy(() => import('./pages/Admin/Users'));
const Roles = React.lazy(() => import('./pages/Admin/Roles'));
const Views = React.lazy(() => import('./pages/Admin/Views'));
const DataImport = React.lazy(() => import('./pages/Admin/DataImport'));
const Cleanup = React.lazy(() => import('./pages/Admin/Cleanup')); // NUEVO
const Tickets = React.lazy(() => import('./pages/Admin/Tickets'));
const UploadHistory = React.lazy(() => import('./pages/Admin/UploadHistory')); // NEW: Historial de Cargas

// Fallback 404
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Mapeo de rutas a permisos requeridos (solo necesita UNO de los listados)
const ROUTE_PERMISSIONS = {
  '/dashboard': ['view_dashboard'],

  // TMS
  '/tms/dashboard': ['view_tms_dashboard'],
  '/tms/planning': ['view_routes', 'create_routes'],
  '/tms/control-tower': ['view_control_tower', 'manage_control_tower'],
  '/tms/drivers': ['view_drivers', 'manage_drivers'],
  '/tms/mobile': ['view_mobile_app', 'use_mobile_app'],
  '/tms/yard': ['view_control_tower'], // NUEVO (Usa permiso de torre de control)
  '/mobile/pda': ['view_stock', 'manage_inventory'], // NUEVO (Permisos de stock)

  // Inbound
  '/inbound/entry': ['view_entry', 'process_entry'],
  '/inbound/cubing': ['view_reception', 'process_reception'], // Nuevo módulo usa mismos permisos de recepción
  '/inbound/data-import': ['manage_data_import'],

  // Outbound
  '/outbound/sales-orders': ['view_sales_orders', 'manage_sales_orders'],
  '/outbound/picking': ['view_picking', 'process_picking'],
  '/outbound/packing': ['view_packing', 'process_packing'],
  '/outbound/packing-tv': ['view_packing_tv'], // NUEVO (Monitor Packing)
  '/outbound/shipping': ['view_shipping', 'process_shipping'],

  // Queries
  '/queries/batches': ['view_batches'],
  '/queries/sales-status': ['view_sales_status'],
  '/queries/addresses': ['view_addresses'],
  '/queries/locations': ['view_locations'],
  '/queries/heatmap': ['view_locations'],
  '/queries/historial-nv': ['view_historial_nv'],
  '/queries/dispatch-control': ['view_dispatch_control'],
  
  // Admin (solo ADMIN)
  '/admin/users': ['manage_users', 'view_users'],
  '/admin/roles': ['manage_roles', 'view_roles'],
  '/admin/views': ['manage_views', 'view_views'],
  '/admin/cleanup': ['manage_cleanup'], // NUEVO (Limpieza)
  '/admin/tickets': ['manage_tickets'], // NUEVO (Soporte TI)
  '/admin/upload-history': ['admin_upload_history'], // NEW: Historial de Cargas
};

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


// Global Suspense Loader Cyber-Logístico
const SuspenseLoader = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
    <div className="relative w-24 h-24 mb-4">
      <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 bg-orange-500/20 rounded-full animate-ping"></div>
      </div>
    </div>
    <h2 className="text-orange-400 font-black tracking-[0.2em] uppercase text-sm animate-pulse">Inicializando Módulo...</h2>
  </div>
);

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

            <a href="/dashboard" className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors">
              Volver al Dashboard
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

// Ruta Protegida con validación de permisos
const ProtectedRoute = () => {
  const { isAuthenticated, loading, user, hasPermission } = useAuth();
  const location = useLocation();

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

  // Obtener los permisos requeridos para esta ruta
  const requiredPermissions = ROUTE_PERMISSIONS[location.pathname] || [];

  // Validar permisos
  // Si es ADMIN, o tiene poder de delegado, o la ruta no exige nada, o califica a la ruta exigida
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

function AppContent() {
  const { user } = useAuth();

  // Inicializar OTA Updates y Notificaciones Globales
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      initOTAUpdates();
    }

    // --- SISTEMA DE DETECCIÓN GLOBAL DE SUBIDA DE DATOS ---
    // Escuchar inserciones en tms_historial_cargas para notificar a los interesados
    const channel = supabase
      .channel('global-upload-detector')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tms_historial_cargas' },
        (payload) => {
          const { modulo, usuario_nombre, registros_totales, registros_error } = payload.new;
          
          // No notificar al mismo usuario que subió los datos (evitar spam)
          if (user && usuario_nombre.includes(user.nombre?.split(' ')[0])) return;

          toast.info(`Nueva subida: ${modulo}`, {
            description: `${usuario_nombre} cargó ${registros_totales} registros.${registros_error > 0 ? ` (${registros_error} errores)` : ''}`,
            icon: <Database className="text-orange-500" size={18} />,
            duration: 6000,
            action: {
              label: 'Ver Historial',
              onClick: () => window.location.href = '/admin/upload-history'
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <Router>
      <CommandPalette />
      <Suspense fallback={<SuspenseLoader />}><Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes (Wrapped in ProtectedRoute) */}
        <Route path="/" element={<ProtectedRoute />}>
          {/* Smart redirect: ir a la primera ruta que el usuario puede ver */}
          <Route index element={<SmartRedirect />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* TMS Modules */}
          <Route path="tms/dashboard" element={<DashboardTMS />} />
          <Route path="tms/planning" element={<RoutePlanning />} />
          <Route path="tms/control-tower" element={<ControlTower />} />
          <Route path="tms/drivers" element={<Drivers />} />
          <Route path="tms/mobile" element={<MobileApp />} />
          <Route path="tms/yard" element={<YardManagement />} />
          <Route path="mobile/pda" element={<WarehousePDA />} />

          {/* Inbound Modules */}
          <Route path="inbound/entry" element={<Entry />} />
          <Route path="inbound/cubing" element={<CubingRegistry />} />
          <Route path="inbound/data-import" element={<DataImport />} />

          {/* Outbound Modules */}
          <Route path="outbound/sales-orders" element={<SalesOrders />} />
          <Route path="outbound/picking" element={<Picking />} />
          <Route path="outbound/packing" element={<Packing />} />
          <Route path="outbound/packing-tv" element={<PackingTV />} />
          <Route path="outbound/shipping" element={<Shipping />} />

          {/* Queries Modules */}
          <Route path="queries/batches" element={<Batches />} />
          <Route path="queries/sales-status" element={<SalesStatus />} />
          <Route path="queries/addresses" element={<Addresses />} />
          <Route path="queries/locations" element={<WmsLocations />} />
          <Route path="queries/heatmap" element={<Heatmap />} />
          <Route path="queries/historial-nv" element={<HistorialNV />} />
          <Route path="queries/dispatch-control" element={<DispatchControl />} />

          {/* Admin Modules */}
          <Route path="admin/users" element={<Users />} />
          <Route path="admin/roles" element={<Roles />} />
          <Route path="admin/views" element={<Views />} />
          <Route path="admin/cleanup" element={<Cleanup />} />
          <Route path="admin/tickets" element={<Tickets />} />
          <Route path="admin/upload-history" element={<UploadHistory />} />
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
