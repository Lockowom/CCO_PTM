import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RoutePlanning from './pages/TMS/RoutePlanning';
import Placeholder from './components/Placeholder';

// Layout Wrapper to apply Sidebar to internal pages
const AppLayout = () => (
  <Layout>
    <Outlet />
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
          <Route path="tms/dashboard" element={<Placeholder title="Dashboard TMS" />} />
          <Route path="tms/planning" element={<RoutePlanning />} />
          <Route path="tms/control-tower" element={<Placeholder title="Torre de Control" />} />
          <Route path="tms/drivers" element={<Placeholder title="Gestión de Conductores" />} />
          <Route path="tms/mobile" element={<Placeholder title="App Móvil" />} />

          {/* Inbound Modules */}
          <Route path="inbound/reception" element={<Placeholder title="Recepción" />} />
          <Route path="inbound/entry" element={<Placeholder title="Ingreso" />} />

          {/* Outbound Modules */}
          <Route path="outbound/sales-orders" element={<Placeholder title="Notas de Venta" />} />
          <Route path="outbound/picking" element={<Placeholder title="Picking" />} />
          <Route path="outbound/packing" element={<Placeholder title="Packing" />} />
          <Route path="outbound/shipping" element={<Placeholder title="Despachos" />} />
          <Route path="outbound/deliveries" element={<Placeholder title="Entregas" />} />

          {/* Inventory Modules */}
          <Route path="inventory/stock" element={<Placeholder title="Stock Actual" />} />
          <Route path="inventory/layout" element={<Placeholder title="Layout Bodega" />} />
          <Route path="inventory/transfers" element={<Placeholder title="Transferencias" />} />

          {/* Queries Modules */}
          <Route path="queries/batches" element={<Placeholder title="Consulta Lotes/Series" />} />
          <Route path="queries/sales-status" element={<Placeholder title="Estado N.V." />} />
          <Route path="queries/addresses" element={<Placeholder title="Direcciones" />} />

          {/* Admin Modules */}
          <Route path="admin/users" element={<Placeholder title="Usuarios" />} />
          <Route path="admin/roles" element={<Placeholder title="Roles y Permisos" />} />
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