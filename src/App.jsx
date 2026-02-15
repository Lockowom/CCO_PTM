import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Placeholder from './components/Placeholder';
import { Lock } from 'lucide-react';

// Login & Dashboard
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// TMS Modules
import RoutePlanning from './pages/TMS/RoutePlanning';
import Drivers from './pages/TMS/Drivers';
import ControlTower from './pages/TMS/ControlTower';
import MobileApp from './pages/TMS/MobileApp';

// Inbound Modules
import Reception from './pages/Inbound/Reception';
import Entry from './pages/Inbound/Entry';

// Outbound Modules
import SalesOrders from './pages/Outbound/SalesOrders';
import Picking from './pages/Outbound/Picking';
import Packing from './pages/Outbound/Packing';
import Shipping from './pages/Outbound/Shipping';

// Inventory Modules
import Stock from './pages/Inventory/Stock';
import InventoryLayout from './pages/Inventory/Layout';

// Queries Modules
import Batches from './pages/Queries/Batches';
import SalesStatus from './pages/Queries/SalesStatus';
import Addresses from './pages/Queries/Addresses';
import Locations from './pages/Queries/Locations';
import HistorialNV from './pages/Queries/HistorialNV';

// Admin Modules
import Users from './pages/Admin/Users';
import Roles from './pages/Admin/Roles';
import Views from './pages/Admin/Views';
import Mediciones from './pages/Admin/Mediciones';
import DataImport from './pages/Admin/DataImport';
import Cleanup from './pages/Admin/Cleanup';

// Mapeo de rutas a permisos requeridos (solo necesita UNO de los listados)
const ROUTE_PERMISSIONS = {
  '/dashboard': ['view_dashboard'],

  // TMS
  '/tms/dashboard': ['view_tms_dashboard'],
  '/tms/planning': ['view_routes', 'create_routes'],
  '/tms/control-tower': ['view_control_tower', 'manage_control_tower'],
  '/tms/drivers': ['view_drivers', 'manage_drivers'],
  '/tms/mobile': ['view_mobile_app', 'use_mobile_app'],

  // Inbound
  '/inbound/reception': ['view_reception', 'process_reception'],
  '/inbound/entry': ['view_entry', 'process_entry'],

  // Outbound
  '/outbound/sales-orders': ['view_sales_orders', 'manage_sales_orders'],
  '/outbound/picking': ['view_picking', 'process_picking'],
  '/outbound/packing': ['view_packing', 'process_packing'],
  '/outbound/shipping': ['view_shipping', 'process_shipping'],
  '/outbound/deliveries': ['view_deliveries', 'process_deliveries'],

  // Inventory
  '/inventory/stock': ['view_stock', 'manage_stock'],
  '/inventory/layout': ['view_layout', 'manage_layout'],
  '/inventory/transfers': ['view_transfers', 'manage_transfers'],

  // Queries
  '/queries/batches': ['view_batches'],
  '/queries/sales-status': ['view_sales_status'],
  '/queries/addresses': ['view_addresses'],
  '/queries/locations': ['view_locations'],
  '/queries/historial-nv': ['view_historial_nv'],

  // Admin (solo ADMIN)
  '/admin/users': ['manage_users'],
  '/admin/roles': ['manage_roles'],
  '/admin/views': ['manage_views'],
  '/admin/mediciones': ['manage_mediciones'],
  '/admin/reports': ['view_reports'],
  '/admin/data-import': ['manage_data_import'],
  '/admin/cleanup': ['manage_cleanup'] // Requiere rol ADMIN
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
  if (user?.rol === 'ADMIN') {
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
  // Si es ADMIN o tiene al menos un permiso requerido, puede acceder
  const hasAccess = user?.rol === 'ADMIN' || requiredPermissions.length === 0 ||
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

          {/* TMS Modules */}
          <Route path="tms/dashboard" element={<Placeholder title="Dashboard TMS" />} />
          <Route path="tms/planning" element={<RoutePlanning />} />
          <Route path="tms/control-tower" element={<ControlTower />} />
          <Route path="tms/drivers" element={<Drivers />} />
          <Route path="tms/mobile" element={<MobileApp />} />

          {/* Inbound Modules */}
          <Route path="inbound/reception" element={<Reception />} />
          <Route path="inbound/entry" element={<Entry />} />

          {/* Outbound Modules */}
          <Route path="outbound/sales-orders" element={<SalesOrders />} />
          <Route path="outbound/picking" element={<Picking />} />
          <Route path="outbound/packing" element={<Packing />} />
          <Route path="outbound/shipping" element={<Shipping />} />
          <Route path="outbound/deliveries" element={<Placeholder title="Entregas" />} />

          {/* Inventory Modules */}
          <Route path="inventory/stock" element={<Stock />} />
          <Route path="inventory/layout" element={<InventoryLayout />} />
          <Route path="inventory/transfers" element={<Placeholder title="Transferencias" />} />

          {/* Queries Modules */}
          <Route path="queries/batches" element={<Batches />} />
          <Route path="queries/sales-status" element={<SalesStatus />} />
          <Route path="queries/addresses" element={<Addresses />} />
          <Route path="queries/locations" element={<Locations />} />
          <Route path="queries/historial-nv" element={<HistorialNV />} />

          {/* Admin Modules */}
          <Route path="admin/users" element={<Users />} />
          <Route path="admin/roles" element={<Roles />} />
          <Route path="admin/views" element={<Views />} />
          <Route path="admin/mediciones" element={<Mediciones />} />
          <Route path="admin/data-import" element={<DataImport />} />
          <Route path="admin/cleanup" element={<Cleanup />} />
          <Route path="admin/reports" element={<Placeholder title="Reportes" />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
