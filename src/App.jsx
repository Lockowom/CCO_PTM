import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Layout from './components/Layout';

// Eager load critical pages
import Login from './pages/Login';

// Lazy load all other pages to improve initial load time
const Dashboard = lazy(() => import('./pages/Dashboard'));
const RoutePlanning = lazy(() => import('./pages/TMS/RoutePlanning'));
const Drivers = lazy(() => import('./pages/TMS/Drivers'));
const SalesStatus = lazy(() => import('./pages/Queries/SalesStatus'));
const Batches = lazy(() => import('./pages/Queries/Batches'));
const Stock = lazy(() => import('./pages/Inventory/Stock'));
const SalesOrders = lazy(() => import('./pages/Outbound/SalesOrders'));
const Picking = lazy(() => import('./pages/Outbound/Picking'));
const Packing = lazy(() => import('./pages/Outbound/Packing'));
const Shipping = lazy(() => import('./pages/Outbound/Shipping'));
const Reception = lazy(() => import('./pages/Inbound/Reception'));
const Entry = lazy(() => import('./pages/Inbound/Entry'));
const Users = lazy(() => import('./pages/Admin/Users'));
const Roles = lazy(() => import('./pages/Admin/Roles'));
const Placeholder = lazy(() => import('./components/Placeholder'));

// Loading Component
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
    <Loader2 size={48} className="animate-spin text-indigo-500 mb-4" />
    <p className="text-slate-500 font-medium animate-pulse">Cargando módulo...</p>
  </div>
);

// Layout Wrapper to apply Sidebar to internal pages
const AppLayout = () => (
  <Layout>
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  </Layout>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes (Wrapped in Layout) */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* TMS Modules */}
          <Route path="tms/dashboard" element={<Dashboard />} />
          <Route path="tms/planning" element={<RoutePlanning />} />
          <Route path="tms/control-tower" element={<Dashboard />} />
          <Route path="tms/drivers" element={<Drivers />} />
          <Route path="tms/mobile" element={<Placeholder title="App Móvil" />} />

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
          <Route path="inventory/layout" element={<Placeholder title="Layout Bodega" />} />
          <Route path="inventory/transfers" element={<Placeholder title="Transferencias" />} />

          {/* Queries Modules */}
          <Route path="queries/batches" element={<Batches />} />
          <Route path="queries/sales-status" element={<SalesStatus />} />
          <Route path="queries/addresses" element={<Placeholder title="Direcciones" />} />

          {/* Admin Modules */}
          <Route path="admin/users" element={<Users />} />
          <Route path="admin/roles" element={<Roles />} />
          <Route path="admin/views" element={<Placeholder title="Configuración de Vistas" />} />
          <Route path="admin/reports" element={<Placeholder title="Reportes" />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
