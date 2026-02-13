import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Placeholder from './components/Placeholder';

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

// Ruta Protegida - Solo si está autenticado
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

// Layout Wrapper para rutas protegidas
const AppLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes (Wrapped in ProtectedRoute) */}
        <Route path="/" element={<ProtectedRoute />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
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
