import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Placeholder from './components/Placeholder';
import { Lock } from 'lucide-react';

// Login & Dashboard
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics/Analytics';
import WarehouseTV from './pages/Analytics/WarehouseTV'; // NUEVO

// TMS Modules
import RoutePlanning from './pages/TMS/RoutePlanning';
import Drivers from './pages/TMS/Drivers';
import ControlTower from './pages/TMS/ControlTower';
import MobileApp from './pages/TMS/MobileApp';
import YardManagement from './pages/TMS/YardManagement'; // NUEVO
import WarehousePDA from './pages/Mobile/WarehousePDA'; // NUEVO

// Inbound Modules
import Reception from './pages/Inbound/Reception';
import Entry from './pages/Inbound/Entry';
import Returns from './pages/Inbound/Returns'; // NUEVO
import CubingRegistry from './pages/Inbound/CubingRegistry'; // NUEVO - Registro Cubicaje

// Outbound Modules
import SalesOrders from './pages/Outbound/SalesOrders';
import Picking from './pages/Outbound/Picking';
import Packing from './pages/Outbound/Packing';
import PackingTV from './pages/Outbound/PackingTV'; // NUEVO
import Shipping from './pages/Outbound/Shipping';

// Inventory Modules
import Stock from './pages/Inventory/Stock';
import InventoryLayout from './pages/Inventory/Layout';
import DashboardWMS from './pages/Inventory/DashboardWMS';
import Transfers from './pages/Inventory/Transfers';
import CycleCount from './pages/Inventory/CycleCount';
import Replenishment from './pages/Inventory/Replenishment'; // NUEVO

// Quality Control Modules
import Inspection from './pages/QualityControl/Inspection';

// Queries Modules
import Batches from './pages/Queries/Batches';
import SalesStatus from './pages/Queries/SalesStatus';
import Addresses from './pages/Queries/Addresses';
import Locations from './pages/Queries/Locations';
import HistorialNV from './pages/Queries/HistorialNV';
import DispatchControl from './pages/Queries/DispatchControl';
import Kardex from './pages/Queries/Kardex'; // NUEVO
import Productivity from './pages/Queries/Productivity'; // NUEVO

// Admin Modules
import Users from './pages/Admin/Users';
import Roles from './pages/Admin/Roles';
import Views from './pages/Admin/Views';
import Mediciones from './pages/Admin/Mediciones';
import DataImport from './pages/Admin/DataImport';
import Cleanup from './pages/Admin/Cleanup'; // NUEVO
import TimeReports from './pages/Admin/TimeReports';
import Tickets from './pages/Admin/Tickets';
import UsuariosActivos from './pages/Admin/UsuariosActivos'; // NUEVO
import LoginHistory from './pages/Admin/LoginHistory'; // NUEVO
import WmsSettings from './pages/Admin/WmsSettings'; // NUEVO
import SystemHealth from './pages/Admin/SystemHealth'; // NUEVO
import OpsControl from './pages/Admin/OpsControl'; // NUEVO
import AuditLogs from './pages/Admin/AuditLogs'; // NUEVO
import UploadHistory from './pages/Admin/UploadHistory'; // NEW: Historial de Cargas

// Mapeo de rutas a permisos requeridos (solo necesita UNO de los listados)
const ROUTE_PERMISSIONS = {
  '/dashboard': ['view_dashboard'],

  // Analytics
  '/analytics': ['view_reports'],
  '/analytics/tv': ['view_reports'], // NUEVO (Pantalla TV)

  // TMS
  '/tms/dashboard': ['view_tms_dashboard'],
  '/tms/planning': ['view_routes', 'create_routes'],
  '/tms/control-tower': ['view_control_tower', 'manage_control_tower'],
  '/tms/drivers': ['view_drivers', 'manage_drivers'],
  '/tms/mobile': ['view_mobile_app', 'use_mobile_app'],
  '/tms/yard': ['view_control_tower'], // NUEVO (Usa permiso de torre de control)
  '/mobile/pda': ['view_stock', 'manage_inventory'], // NUEVO (Permisos de stock)

  // Inbound
  '/inbound/reception': ['view_reception', 'process_reception'],
  '/inbound/entry': ['view_entry', 'process_entry'],
  '/inbound/returns': ['view_reception', 'process_reception'],
  '/inbound/cubing': ['view_reception', 'process_reception'], // Nuevo módulo usa mismos permisos de recepción
  '/inbound/data-import': ['manage_data_import'],

  // Outbound
  '/outbound/sales-orders': ['view_sales_orders', 'manage_sales_orders'],
  '/outbound/picking': ['view_picking', 'process_picking'],
  '/outbound/packing': ['view_packing', 'process_packing'],
  '/outbound/packing-tv': ['view_packing_tv'], // NUEVO (Monitor Packing)
  '/outbound/shipping': ['view_shipping', 'process_shipping'],
  '/outbound/deliveries': ['view_deliveries', 'process_deliveries'],

  // Inventory
  '/inventory/dashboard': ['view_stock', 'view_layout'], // Permitir si puede ver stock o layout
  '/inventory/stock': ['view_stock', 'manage_stock'],
  '/inventory/layout': ['view_layout', 'manage_layout'],
  '/inventory/transfers': ['view_transfers', 'manage_transfers'],
  '/inventory/cycle-count': ['view_stock', 'manage_inventory'],
  '/inventory/replenishment': ['view_stock', 'manage_inventory'], // NUEVO (Usa mismos permisos que stock)

  // Quality Control
  '/quality/inspection': ['view_quality', 'process_quality'],

  // Queries
  '/queries/batches': ['view_batches'],
  '/queries/sales-status': ['view_sales_status'],
  '/queries/addresses': ['view_addresses'],
  '/queries/locations': ['view_locations'],
  '/queries/historial-nv': ['view_historial_nv'],
  '/queries/dispatch-control': ['view_dispatch_control'],
  '/queries/kardex': ['view_stock'], // NUEVO (Usa permiso de stock)
  '/queries/productivity': ['view_reports'], // NUEVO

  // Admin (solo ADMIN)
  '/admin/users': ['manage_users', 'view_users'],
  '/admin/roles': ['manage_roles', 'view_roles'],
  '/admin/views': ['manage_views', 'view_views'],
  '/admin/mediciones': ['manage_mediciones', 'view_mediciones'],
  '/admin/reports': ['view_reports'],
  '/admin/time-reports': ['view_time_reports'],
  '/admin/tickets': ['manage_tickets'], // NUEVO (Soporte TI)
  '/admin/active-users': ['manage_users', 'view_users'], // NUEVO (usa permiso de usuarios)
  '/admin/login-history': ['manage_users', 'view_users'], // NUEVO
  '/admin/wms-settings': ['manage_views', 'view_views'], // NUEVO (Configuración General)
  '/admin/system-health': ['manage_mediciones', 'view_mediciones'], // NUEVO (Monitoreo)
  '/admin/ops-control': ['manage_users', 'view_users'], // NUEVO (Control de Procesos)
  '/admin/audit-logs': ['view_reports'], // NUEVO (Auditoría)
  '/admin/cleanup': ['manage_cleanup'], // NUEVO (Limpieza)
};

// Orden de prioridad para la primera ruta disponible
const ROUTE_PRIORITY = [
  '/dashboard',
  '/outbound/sales-orders',
  '/outbound/picking',
  '/outbound/packing',
  '/outbound/shipping',
  '/inbound/reception',
  '/inbound/entry',
  '/inventory/stock',
  '/inventory/layout',
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
  '/admin/mediciones',
  '/admin/reports',
];

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
  const { user, hasPermission, loading, permissions } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-slate-500 font-medium">Cargando...</div>
      </div>
    );
  }

  // ADMIN tiene acceso a todo → ir al dashboard
  if (user?.rol === 'ADMIN' || user?.es_admin_delegado) {
    return <Navigate to="/dashboard" replace />;
  }

  // Para otros roles, buscar la primera ruta a la que tienen acceso
  for (const route of ROUTE_PRIORITY) {
    const requiredPerms = ROUTE_PERMISSIONS[route] || [];
    if (requiredPerms.length === 0) {
      return <Navigate to={route} replace />;
    }
    const hasAccess = requiredPerms.some(perm => hasPermission(perm));
    if (hasAccess) {
      console.log('✓ Redirigiendo a primera ruta disponible:', route);
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
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes (Wrapped in ProtectedRoute) */}
        <Route path="/" element={<ProtectedRoute />}>
          {/* Smart redirect: ir a la primera ruta que el usuario puede ver */}
          <Route index element={<SmartRedirect />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="analytics/tv" element={<WarehouseTV />} />

          {/* TMS Modules */}
          <Route path="tms/dashboard" element={<Placeholder title="Dashboard TMS" />} />
          <Route path="tms/planning" element={<RoutePlanning />} />
          <Route path="tms/control-tower" element={<ControlTower />} />
          <Route path="tms/drivers" element={<Drivers />} />
          <Route path="tms/mobile" element={<MobileApp />} />
          <Route path="tms/yard" element={<YardManagement />} />
          <Route path="mobile/pda" element={<WarehousePDA />} />

          {/* Inbound Modules */}
          <Route path="inbound/reception" element={<Reception />} />
          <Route path="inbound/entry" element={<Entry />} />
          <Route path="inbound/returns" element={<Returns />} />
          <Route path="inbound/cubing" element={<CubingRegistry />} />
          <Route path="inbound/data-import" element={<DataImport />} />

          {/* Outbound Modules */}
          <Route path="outbound/sales-orders" element={<SalesOrders />} />
          <Route path="outbound/picking" element={<Picking />} />
          <Route path="outbound/packing" element={<Packing />} />
          <Route path="outbound/packing-tv" element={<PackingTV />} />
          <Route path="outbound/shipping" element={<Shipping />} />
          <Route path="outbound/deliveries" element={<Placeholder title="Entregas" />} />

          {/* Inventory Modules */}
          <Route path="inventory/dashboard" element={<DashboardWMS />} />
          <Route path="inventory/stock" element={<Stock />} />
          <Route path="inventory/layout" element={<InventoryLayout />} />
          <Route path="inventory/transfers" element={<Transfers />} />
          <Route path="inventory/cycle-count" element={<CycleCount />} />
          <Route path="inventory/replenishment" element={<Replenishment />} />

          {/* Quality Control Modules */}
          <Route path="quality/inspection" element={<Inspection />} />

          {/* Queries Modules */}
          <Route path="queries/batches" element={<Batches />} />
          <Route path="queries/sales-status" element={<SalesStatus />} />
          <Route path="queries/addresses" element={<Addresses />} />
          <Route path="queries/locations" element={<Locations />} />
          <Route path="queries/historial-nv" element={<HistorialNV />} />
          <Route path="queries/dispatch-control" element={<DispatchControl />} />
          <Route path="queries/kardex" element={<Kardex />} />
          <Route path="queries/productivity" element={<Productivity />} />

          {/* Admin Modules */}
          <Route path="admin/users" element={<Users />} />
          <Route path="admin/roles" element={<Roles />} />
          <Route path="admin/views" element={<Views />} />
          <Route path="admin/mediciones" element={<Mediciones />} />
          <Route path="admin/cleanup" element={<Cleanup />} />
          <Route path="admin/reports" element={<Placeholder title="Reportes Generales" />} />
          <Route path="admin/time-reports" element={<TimeReports />} />
          <Route path="admin/upload-history" element={<UploadHistory />} />
          <Route path="admin/tickets" element={<Tickets />} />
          <Route path="admin/cleanup" element={<Cleanup />} />
          <Route path="admin/active-users" element={<UsuariosActivos />} />
          <Route path="admin/login-history" element={<LoginHistory />} />
          <Route path="admin/wms-settings" element={<WmsSettings />} />
          <Route path="admin/system-health" element={<SystemHealth />} />
          <Route path="admin/ops-control" element={<OpsControl />} />
          <Route path="admin/audit-logs" element={<AuditLogs />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

import { Toaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <Toaster richColors position="top-right" />
      <AppContent />
    </AuthProvider>
  );
}

export default App;
