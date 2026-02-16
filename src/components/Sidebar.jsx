import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import {
  LayoutDashboard,
  Map,
  Satellite,
  Users,
  Smartphone,
  ArrowDownToLine,
  Truck,
  PackagePlus,
  ArrowUpFromLine,
  FileText,
  Hand,
  Package,
  Ship,
  Warehouse,
  MapPin,
  ArrowLeftRight,
  Search,
  Barcode,
  MapPinned,
  Settings,
  Shield,
  Layers,
  FileBarChart,
  ChevronDown,
  ChevronRight,
  History,
  Timer,
  Upload,
  Trash2,
  Clock,
  MessageSquare,
  Activity
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { user, permissions, hasPermission, refreshPermissions } = useAuth();
  const { isModuleEnabled, refreshConfig } = useConfig();
  const [expandedSections, setExpandedSections] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Log para debug
  console.log('🔄 Sidebar render - User:', user?.nombre, '| Permisos:', permissions?.length);

  // Permisos por sección
  const SECTION_PERMISSIONS = {
    'tms': ['view_routes', 'view_control_tower', 'view_drivers', 'view_mobile_app', 'view_tms_dashboard'],
    'dashboard': ['view_dashboard'],
    'inbound': ['view_reception', 'view_entry'],
    'outbound': ['view_sales_orders', 'view_picking', 'view_packing', 'view_shipping', 'view_deliveries'],
    'inventory': ['view_stock', 'view_layout', 'view_transfers'],
    'queries': ['view_batches', 'view_sales_status', 'view_addresses', 'view_locations', 'view_historial_nv'],
    'admin': ['manage_users', 'manage_roles', 'manage_views']
  };

  // Permisos por ruta
  const ROUTE_PERMISSIONS = {
    '/dashboard': 'view_dashboard',
    '/tms/dashboard': 'view_tms_dashboard',
    '/tms/planning': 'view_routes',
    '/tms/control-tower': 'view_control_tower',
    '/tms/drivers': 'view_drivers',
    '/tms/mobile': 'view_mobile_app',
    '/inbound/reception': 'view_reception',
    '/inbound/entry': 'view_entry',
    '/outbound/sales-orders': 'view_sales_orders',
    '/outbound/picking': 'view_picking',
    '/outbound/packing': 'view_packing',
    '/outbound/shipping': 'view_shipping',
    '/outbound/deliveries': 'view_deliveries',
    '/inventory/stock': 'view_stock',
    '/inventory/layout': 'view_layout',
    '/inventory/transfers': 'view_transfers',
    '/queries/batches': 'view_batches',
    '/queries/sales-status': 'view_sales_status',
    '/queries/addresses': 'view_addresses',
    '/queries/locations': 'view_locations',
    '/queries/historial-nv': 'view_historial_nv',
    '/admin/users': 'manage_users',
    '/admin/roles': 'manage_roles',
    '/admin/views': 'manage_views',
    '/admin/mediciones': 'manage_mediciones',
    '/admin/data-import': 'manage_data_import',
    '/admin/cleanup': 'manage_cleanup',
    '/admin/time-reports': 'view_time_reports',
    '/admin/tickets': 'manage_tickets',
    '/admin/active-users': 'manage_users'
  };

  // Verificar si una sección está visible
  const isSectionVisible = (sectionId) => {
    // Verificar módulo habilitado
    if (!isModuleEnabled(sectionId)) return false;
    
    // ADMIN siempre ve todo
    if (user?.rol === 'ADMIN') return true;
    
    // Sección admin solo para rol ADMIN
    if (sectionId === 'admin') return false;
    
    // Verificar que tenga al menos un permiso de la sección
    const sectionPerms = SECTION_PERMISSIONS[sectionId] || [];
    return sectionPerms.some(perm => hasPermission(perm));
  };

  // Verificar si una ruta está accesible
  const isRouteAccessible = (path, sectionId) => {
    // ADMIN ve todo
    if (user?.rol === 'ADMIN') return true;
    
    // Sección admin solo ADMIN
    if (sectionId === 'admin') return user?.rol === 'ADMIN';
    
    const requiredPerm = ROUTE_PERMISSIONS[path];
    if (!requiredPerm) return true;
    
    return hasPermission(requiredPerm);
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Refrescar todo manualmente
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshPermissions(), refreshConfig()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Configuración del menú
  const menuConfig = [
    {
      id: 'tms',
      label: 'TMS',
      icon: <Map size={20} />,
      color: 'text-emerald-500',
      modules: [
        { id: 'tms-dashboard', label: 'Dashboard TMS', icon: <LayoutDashboard size={18} />, path: '/tms/dashboard' },
        { id: 'tms-routes', label: 'Planificar Rutas', icon: <MapPinned size={18} />, path: '/tms/planning' },
        { id: 'tms-control', label: 'Torre de Control', icon: <Satellite size={18} />, path: '/tms/control-tower' },
        { id: 'tms-drivers', label: 'Conductores', icon: <Users size={18} />, path: '/tms/drivers' },
        { id: 'tms-mobile', label: 'App Móvil', icon: <Smartphone size={18} />, path: '/tms/mobile' }
      ]
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <FileBarChart size={20} />,
      color: 'text-indigo-500',
      isLink: true,
      path: '/dashboard'
    },
    {
      id: 'inbound',
      label: 'Inbound',
      icon: <ArrowDownToLine size={20} />,
      color: 'text-emerald-500',
      modules: [
        { id: 'inbound-reception', label: 'Recepción', icon: <Truck size={18} />, path: '/inbound/reception' },
        { id: 'inbound-entry', label: 'Ingreso', icon: <PackagePlus size={18} />, path: '/inbound/entry' }
      ]
    },
    {
      id: 'outbound',
      label: 'Outbound',
      icon: <ArrowUpFromLine size={20} />,
      color: 'text-blue-500',
      modules: [
        { id: 'outbound-sales-orders', label: 'Notas de Venta', icon: <FileText size={18} />, path: '/outbound/sales-orders' },
        { id: 'outbound-picking', label: 'Picking', icon: <Hand size={18} />, path: '/outbound/picking' },
        { id: 'outbound-packing', label: 'Packing', icon: <Package size={18} />, path: '/outbound/packing' },
        { id: 'outbound-shipping', label: 'Despachos', icon: <Ship size={18} />, path: '/outbound/shipping' },
        { id: 'outbound-deliveries', label: 'Entregas', icon: <Truck size={18} />, path: '/outbound/deliveries' }
      ]
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: <Warehouse size={20} />,
      color: 'text-amber-500',
      modules: [
        { id: 'inventory-stock', label: 'Stock', icon: <Package size={18} />, path: '/inventory/stock' },
        { id: 'inventory-layout', label: 'Layout', icon: <MapPin size={18} />, path: '/inventory/layout' },
        { id: 'inventory-transfers', label: 'Transferencias', icon: <ArrowLeftRight size={18} />, path: '/inventory/transfers' }
      ]
    },
    {
      id: 'queries',
      label: 'Consultas',
      icon: <Search size={20} />,
      color: 'text-violet-500',
      modules: [
        { id: 'queries-historial-nv', label: 'Historial N.V.', icon: <History size={18} />, path: '/queries/historial-nv' },
        { id: 'queries-batches', label: 'Lotes/Series', icon: <Barcode size={18} />, path: '/queries/batches' },
        { id: 'queries-sales-status', label: 'Estado N.V', icon: <FileText size={18} />, path: '/queries/sales-status' },
        { id: 'queries-addresses', label: 'Direcciones', icon: <MapPin size={18} />, path: '/queries/addresses' },
        { id: 'queries-locations', label: 'Ubicaciones', icon: <MapPinned size={18} />, path: '/queries/locations' },
        { id: 'queries-locations-sheet', label: 'Ubicaciones (Sheet)', icon: <MapPinned size={18} />, path: '/queries/locations-sheet' }
      ]
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: <Settings size={20} />,
      color: 'text-red-500',
      modules: [
        { id: 'admin-mediciones', label: 'Mediciones', icon: <Timer size={18} />, path: '/admin/mediciones' },
        { id: 'users', label: 'Usuarios', icon: <Users size={18} />, path: '/admin/users' },
        { id: 'roles', label: 'Roles', icon: <Shield size={18} />, path: '/admin/roles' },
        { id: 'adminviews', label: 'Vistas', icon: <Layers size={18} />, path: '/admin/views' },
        { id: 'admin-data-import', label: 'Carga Datos', icon: <Upload size={18} />, path: '/admin/data-import' },
        { id: 'reports', label: 'Reportes', icon: <FileBarChart size={18} />, path: '/admin/reports' },
        { id: 'admin-time-reports', label: 'Tiempos', icon: <Clock size={18} />, path: '/admin/time-reports' },
        { id: 'admin-active-users', label: 'Usuarios', icon: <Activity size={18} />, path: '/admin/active-users' },
        { id: 'admin-tickets', label: 'Soporte TI', icon: <MessageSquare size={18} />, path: '/admin/tickets' },
        { id: 'admin-cleanup', label: 'Limpieza', icon: <Trash2 size={18} />, path: '/admin/cleanup' }
      ]
    }
  ];

  return (
    <aside className="bg-slate-900 text-white w-64 flex-shrink-0 hidden md:flex flex-col h-screen overflow-y-auto border-r border-slate-700">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center mb-3 shadow-lg border border-slate-600 p-2">
          <img src="https://i.imgur.com/YJh67CY.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-xl font-black tracking-tight text-white">C.C.O</h1>
        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Centro Control Operacional</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuConfig.map((area) => {
          // Verificar si la sección es visible
          if (!isSectionVisible(area.id)) return null;

          return (
            <div key={area.id} className="mb-2">
              {area.isLink ? (
                // Link directo (ej: Dashboard)
                <Link
                  to={area.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    location.pathname === area.path
                      ? 'bg-slate-800 text-white border-l-4 border-indigo-500'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className={location.pathname === area.path ? area.color : 'text-slate-500 group-hover:text-white'}>
                    {area.icon}
                  </span>
                  <span className="font-medium text-sm">{area.label}</span>
                </Link>
              ) : (
                // Sección expandible
                <div>
                  <button
                    onClick={() => toggleSection(area.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                      expandedSections[area.id] ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={expandedSections[area.id] ? area.color : 'text-slate-500 group-hover:text-white'}>
                        {area.icon}
                      </span>
                      <span className="font-medium text-sm">{area.label}</span>
                    </div>
                    {expandedSections[area.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>

                  {/* Submenu */}
                  {expandedSections[area.id] && (
                    <div className="ml-4 mt-1 pl-4 border-l border-slate-700 space-y-1">
                      {area.modules
                        .filter(module => isRouteAccessible(module.path, area.id))
                        .filter(module => isModuleEnabled(module.id))
                        .map((module) => (
                          <Link
                            key={module.id}
                            to={module.path}
                            className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-colors ${
                              location.pathname === module.path
                                ? 'text-white bg-slate-700 font-medium'
                                : 'text-slate-500 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            {module.icon}
                            <span>{module.label}</span>
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-700 bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm border border-slate-600">
            {user?.nombre?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate capitalize">{user?.nombre || 'Usuario'}</p>
            <p className="text-xs text-slate-400 truncate uppercase">{user?.rol || 'Sin rol'}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-lg transition-all ${
              isRefreshing 
                ? 'text-green-400 animate-spin' 
                : 'text-slate-500 hover:text-white hover:bg-slate-700'
            }`}
            title="Actualizar menú"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
