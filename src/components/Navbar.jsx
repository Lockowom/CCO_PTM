import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import {
  LayoutDashboard, Map, Satellite, Users, Smartphone,
  ArrowDownToLine, Truck,
  ArrowUpFromLine, FileText, Hand, Package, Ship,
  Warehouse, MapPin, ArrowLeftRight,
  Search, Barcode, MapPinned,
  Settings, Shield, Layers, FileBarChart,
  LogOut, ChevronDown, Menu, X, Lock, Upload, RefreshCw,
  Clock, Timer, Trash2, MessageSquare, History, ClipboardCheck, Eye, RotateCcw, Activity, Siren, FileSearch, Anchor, TrendingUp, Monitor, Scan
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // USAR LOS CONTEXTOS - Esto es la clave
  const { user, logout, hasPermission, permissions, refreshPermissions } = useAuth();
  const { isModuleEnabled, refreshConfig } = useConfig();
  
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // DEBUG: Log cada render para ver los permisos actuales
  console.log('🎨 Navbar render | Usuario:', user?.nombre, '| Rol:', user?.rol, '| Permisos:', permissions?.length);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Refrescar todo manualmente
  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log('🔄 Refrescando manualmente...');
    await Promise.all([refreshPermissions(), refreshConfig()]);
    setIsRefreshing(false);
    console.log('✅ Refresh completado');
  };

  // Permisos requeridos por sección
  const SECTION_PERMISSIONS = {
    'tms': ['view_routes', 'view_control_tower', 'view_drivers', 'view_mobile_app', 'view_tms_dashboard'],
    'dashboard': ['view_dashboard', 'view_kpis'],
    'inbound': ['view_reception', 'view_entry'],
    'outbound': ['view_sales_orders', 'view_picking', 'view_packing', 'view_shipping', 'view_deliveries'],
    'inventory': ['view_stock', 'view_layout', 'view_transfers'],
    'quality': ['view_quality'],
    'queries': ['view_batches', 'view_sales_status', 'view_addresses', 'view_locations', 'view_historial_nv', 'view_dispatch_control'],
    'admin': ['manage_users', 'manage_roles', 'manage_views', 'manage_reports', 'manage_data_import']
  };

  // Permisos por ruta específica
  const ROUTE_PERMISSIONS = {
    '/dashboard': 'view_dashboard',
    '/tms/dashboard': 'view_tms_dashboard',
    '/tms/planning': 'view_routes',
    '/tms/control-tower': 'view_control_tower',
    '/tms/yard': 'view_control_tower',
    '/tms/drivers': 'view_drivers',
    '/tms/mobile': 'view_mobile_app',
    '/inbound/reception': 'view_reception',
    '/inbound/returns': 'view_reception',
    '/inbound/entry': 'view_entry',
    '/outbound/sales-orders': 'view_sales_orders',
    '/outbound/picking': 'view_picking',
    '/outbound/packing': 'view_packing',
    '/outbound/shipping': 'view_shipping',
    '/outbound/deliveries': 'view_deliveries',
    '/inventory/dashboard': 'view_stock',
    '/inventory/stock': 'view_stock',
    '/inventory/layout': 'view_layout',
    '/inventory/replenishment': 'view_stock',
    '/inventory/transfers': 'view_transfers',
    '/inventory/cycle-count': 'view_stock',
    '/quality/inspection': 'view_quality',
    '/analytics': 'view_reports',
    '/analytics/tv': 'view_reports',
    '/queries/kardex': 'view_stock',
    '/mobile/pda': 'view_stock',
    '/queries/productivity': 'view_reports',
    '/queries/batches': 'view_batches',
    '/queries/sales-status': 'view_sales_status',
    '/queries/addresses': 'view_addresses',
    '/queries/locations': 'view_locations',
    '/queries/historial-nv': 'view_historial_nv',
    '/queries/dispatch-control': 'view_dispatch_control',
    '/admin/users': 'manage_users',
    '/admin/wms-settings': 'manage_views',
    '/admin/ops-control': 'manage_users',
    '/admin/audit-logs': 'view_reports',
    '/admin/system-health': 'manage_mediciones',
    '/admin/roles': 'manage_roles',
    '/admin/views': 'manage_views',
    '/admin/reports': 'manage_reports',
    '/admin/mediciones': 'manage_mediciones',
    '/admin/data-import': 'manage_data_import',
    '/admin/cleanup': 'manage_cleanup',
    '/admin/time-reports': 'view_time_reports',
    '/admin/tickets': 'manage_tickets',
    '/admin/login-history': 'manage_users'
  };

  // ¿Está la sección visible?
  const isSectionVisible = (sectionId) => {
    // 1. Verificar si el módulo está habilitado globalmente
    if (!isModuleEnabled(sectionId)) {
      return false;
    }

    // 2. ADMIN siempre ve todo
    if (user?.rol === 'ADMIN') {
      return true;
    }

    // 3. Sección admin solo para ADMIN
    if (sectionId === 'admin') {
      return false;
    }

    // 4. Verificar que tenga al menos un permiso de la sección
    const sectionPerms = SECTION_PERMISSIONS[sectionId] || [];
    const hasAccess = sectionPerms.some(perm => hasPermission(perm));
    return hasAccess;
  };

  // ¿Puede acceder a esta ruta específica?
  const canAccessRoute = (path, sectionId) => {
    // ADMIN ve todo
    if (user?.rol === 'ADMIN') return true;
    
    // Sección admin solo ADMIN
    if (sectionId === 'admin') return user?.rol === 'ADMIN';

    // Verificar permiso específico de la ruta
    const requiredPerm = ROUTE_PERMISSIONS[path];
    if (!requiredPerm) return true;
    
    return hasPermission(requiredPerm);
  };

  // Configuración del menú
  const menuConfig = [
    {
      id: 'tms',
      label: 'TMS',
      icon: <Map size={18} />,
      modules: [
        { label: 'Dashboard TMS', path: '/tms/dashboard', icon: <LayoutDashboard size={16} /> },
        { label: 'Planificar Rutas', path: '/tms/planning', icon: <MapPinned size={16} /> },
        { label: 'Torre de Control', path: '/tms/control-tower', icon: <Satellite size={16} /> },
        { label: 'Gestión Patios', path: '/tms/yard', icon: <Anchor size={16} /> },
        { label: 'Conductores', path: '/tms/drivers', icon: <Users size={16} /> },
        { label: 'App Móvil', path: '/tms/mobile', icon: <Smartphone size={16} /> }
      ]
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <FileBarChart size={18} />,
      isLink: true,
      path: '/dashboard'
    },
    {
      id: 'inbound',
      label: 'Inbound',
      icon: <ArrowDownToLine size={18} />,
      modules: [
        { label: 'Recepción', path: '/inbound/reception', icon: <Truck size={16} /> },
        { label: 'Devoluciones', path: '/inbound/returns', icon: <RotateCcw size={16} /> },
        { label: 'Ingreso (Putaway)', path: '/inbound/entry', icon: <ArrowDownToLine size={16} /> }
      ]
    },
    {
      id: 'outbound',
      label: 'Outbound',
      icon: <ArrowUpFromLine size={18} />,
      modules: [
        { label: 'Notas de Venta', path: '/outbound/sales-orders', icon: <FileText size={16} /> },
        { label: 'Picking', path: '/outbound/picking', icon: <Hand size={16} /> },
        { label: 'Packing', path: '/outbound/packing', icon: <Package size={16} /> },
        { label: 'Despachos', path: '/outbound/shipping', icon: <Ship size={16} /> },
        { label: 'Entregas', path: '/outbound/deliveries', icon: <Truck size={16} /> }
      ]
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: <Warehouse size={18} />,
      modules: [
        { label: 'Dashboard WMS', path: '/inventory/dashboard', icon: <LayoutDashboard size={16} /> },
        { label: 'Stock', path: '/inventory/stock', icon: <Package size={16} /> },

        { label: 'Layout', path: '/inventory/layout', icon: <MapPin size={16} /> },
        { label: 'Reabastecer', path: '/inventory/replenishment', icon: <Layers size={16} /> },
        { label: 'Transferencias', path: '/inventory/transfers', icon: <ArrowLeftRight size={16} /> },
        { label: 'Inv. Cíclico', path: '/inventory/cycle-count', icon: <RotateCcw size={16} /> }
      ]
    },
    {
      id: 'quality',
      label: 'Calidad',
      icon: <ClipboardCheck size={18} />,
      modules: [
        { label: 'Inspección', path: '/quality/inspection', icon: <Eye size={16} /> }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <FileBarChart size={18} />,
      modules: [
        { label: 'Reportes', path: '/analytics', icon: <FileText size={16} /> },
        { label: 'Modo TV (Live)', path: '/analytics/tv', icon: <Monitor size={16} /> }
      ]
    },
    {
      id: 'queries',
      label: 'Consultas',
      icon: <Search size={18} />,
      modules: [
        { label: 'Kardex (Trazabilidad)', path: '/queries/kardex', icon: <History size={16} /> },
        { label: 'Rendimiento', path: '/queries/productivity', icon: <TrendingUp size={16} /> },
        { label: 'Historial N.V.', path: '/queries/historial-nv', icon: <FileText size={16} /> },
        { label: 'Control Despacho', path: '/queries/dispatch-control', icon: <Truck size={16} /> },
        { label: 'Lotes/Series', path: '/queries/batches', icon: <Barcode size={16} /> },
        { label: 'Estado N.V.', path: '/queries/sales-status', icon: <FileText size={16} /> },
        { label: 'Direcciones', path: '/queries/addresses', icon: <MapPin size={16} /> },
        { label: 'Ubicaciones', path: '/queries/locations', icon: <MapPinned size={16} /> }
      ]
    },
    {
      label: 'Operación PDA',
      path: '/mobile/pda',
      icon: <Scan size={18} />
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: <Settings size={18} />,
      modules: [
        { label: 'Control Ops', path: '/admin/ops-control', icon: <Siren size={16} /> },
        { label: 'Auditoría', path: '/admin/audit-logs', icon: <FileSearch size={16} /> },
        { label: 'Salud Sistema', path: '/admin/system-health', icon: <Activity size={16} /> },
        { label: 'Config. WMS', path: '/admin/wms-settings', icon: <Settings size={16} /> },
        { label: 'Mediciones', path: '/admin/mediciones', icon: <Timer size={16} /> },
        { label: 'Usuarios', path: '/admin/users', icon: <Users size={16} /> },
        { label: 'Roles', path: '/admin/roles', icon: <Shield size={16} /> },
        { label: 'Vistas', path: '/admin/views', icon: <Layers size={16} /> },
        { label: 'Historial Accesos', path: '/admin/login-history', icon: <History size={16} /> },
        { label: 'Carga Datos', path: '/admin/data-import', icon: <Upload size={16} /> },
        { label: 'Reportes', path: '/admin/reports', icon: <FileBarChart size={16} /> },
        { label: 'Tiempos', path: '/admin/time-reports', icon: <Clock size={16} /> },
        { label: 'Soporte TI', path: '/admin/tickets', icon: <MessageSquare size={16} /> },
        { label: 'Limpieza', path: '/admin/cleanup', icon: <Trash2 size={16} /> }
      ]
    }
  ];

  return (
    <header className="bg-white border-b-2 border-orange-200 shadow-lg sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 sm:px-6 py-2 sm:py-3 gap-2 sm:gap-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 sm:gap-3 min-w-fit">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center shadow-lg border-2 border-orange-300 p-1.5 sm:p-2">
            <img src="https://i.imgur.com/YJh67CY.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base sm:text-lg font-black text-slate-800 leading-none">C.C.O</h1>
            <p className="text-[8px] sm:text-[9px] text-orange-500 font-bold uppercase tracking-widest">Centro Control</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1 flex-nowrap justify-center flex-1 px-2">
          {menuConfig.map((item) => {
            // Verificar visibilidad de la sección
            if (!isSectionVisible(item.id)) return null;

            return (
              <div
                key={item.id}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(item.id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.isLink ? (
                  <Link
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 whitespace-nowrap
                      ${location.pathname === item.path
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'text-slate-700 hover:text-orange-600 hover:bg-orange-50'
                      }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <button
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap
                      ${activeDropdown === item.id
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'text-slate-700 hover:text-orange-600 hover:bg-orange-50'
                      }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    <ChevronDown size={14} className={`transition-transform duration-150 ${activeDropdown === item.id ? 'rotate-180' : ''}`} />
                  </button>
                )}

                {/* Dropdown */}
                {!item.isLink && activeDropdown === item.id && (
                  <div className="absolute top-full left-0 mt-0.5 w-48 sm:w-56 bg-white rounded-lg shadow-2xl border-2 border-orange-100 p-2 z-50">
                    {item.modules.filter(m => canAccessRoute(m.path, item.id)).length === 0 ? (
                      <div className="px-3 py-4 text-center text-slate-400 text-xs">
                        <Lock size={14} className="mx-auto mb-1" />
                        Sin acceso
                      </div>
                    ) : (
                      item.modules.filter(m => canAccessRoute(m.path, item.id)).map((module) => (
                        <Link
                          key={module.path}
                          to={module.path}
                          onClick={() => setActiveDropdown(null)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all
                            ${location.pathname === module.path
                              ? 'bg-orange-500 text-white shadow-md'
                              : 'text-slate-700 hover:bg-orange-100 hover:text-orange-700'
                            }`}
                        >
                          <span>{module.icon}</span>
                          {module.label}
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right Section - INDUSTRIAL DARK WIDGETS */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-fit">
          {/* Botón Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-lg transition-all ${
              isRefreshing 
                ? 'text-green-500 animate-spin bg-green-50' 
                : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50'
            }`}
            title="Actualizar menú"
          >
            <RefreshCw size={18} />
          </button>

          {/* User Profile - LIGHT THEME */}
          {user && (
            <div className="hidden md:flex items-center gap-3 pl-4 border-l-2 border-orange-100">
              <div className="flex items-center gap-3 bg-white pr-4 pl-1 py-1 rounded-full shadow-sm border border-orange-200 group hover:border-orange-400 transition-colors">
                <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-105 transition-transform">
                  {user.nombre?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden lg:block leading-tight">
                  <span className="text-xs font-bold text-slate-700 block tracking-tight">{user.nombre}</span>
                  <span className="text-[9px] font-black text-orange-500 uppercase tracking-wider">{user.rol}</span>
                </div>
              </div>
            </div>
          )}

          {/* Clock Widget - LIGHT THEME */}
          <ClockWidget />

          {/* Logout */}
          <button 
            onClick={handleLogout} 
            className="hidden sm:flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
            title="Cerrar Sesión"
          >
            <LogOut size={18} />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 hover:bg-orange-50 rounded-lg text-slate-600"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <MobileMenu 
          menuConfig={menuConfig}
          isSectionVisible={isSectionVisible}
          canAccessRoute={canAccessRoute}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          setMobileMenuOpen={setMobileMenuOpen}
          location={location}
        />
      )}
    </header>
  );
};

// Clock Widget - Light Theme
const ClockWidget = () => {
  const [now, setNow] = React.useState(new Date());
  
  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const h = now.getHours() % 12 || 12; // 12-hour format
  const m = now.getMinutes().toString().padStart(2, '0');
  const s = now.getSeconds().toString().padStart(2, '0');
  const ampm = now.getHours() < 12 ? 'AM' : 'PM';
  const day = now.getDate().toString().padStart(2, '0');
  const month = now.toLocaleDateString('es-CL', { month: 'short' }).toUpperCase().replace('.', '');

  return (
    <div className="hidden sm:flex items-center bg-white px-3 py-1.5 rounded-lg border border-orange-200 shadow-sm min-w-[130px] justify-between group hover:border-orange-300 transition-colors">
      {/* Time Section */}
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-base font-black text-slate-800 tracking-widest">
          {h.toString().padStart(2, '0')}:{m}
        </span>
        <span className="font-mono text-[10px] font-bold text-slate-400">{s}</span>
      </div>

      {/* AM/PM Badge */}
      <div className="bg-orange-100 px-1.5 py-0.5 rounded ml-2 border border-orange-200">
        <span className="text-[9px] font-black text-orange-600 block leading-none tracking-wider">{ampm}</span>
      </div>

      <div className="w-[1px] h-5 bg-slate-200 mx-2" />

      {/* Date Section */}
      <div className="flex flex-col items-end leading-none">
        <span className="text-[10px] font-bold text-slate-500">{day}-{month}</span>
      </div>
    </div>
  );
};

// Mobile Menu (Light Theme to match Navbar)
const MobileMenu = ({ menuConfig, isSectionVisible, canAccessRoute, activeDropdown, setActiveDropdown, setMobileMenuOpen, location }) => (
  <nav className="xl:hidden bg-white border-b-2 border-orange-100 px-4 py-4 space-y-2 max-h-[80vh] overflow-y-auto shadow-inner">
    {menuConfig.map((item) => {
      if (!isSectionVisible(item.id)) return null;
      
      const isActive = location.pathname === item.path;
      
      return item.isLink ? (
        <Link
          key={item.id}
          to={item.path}
          onClick={() => setMobileMenuOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all
            ${isActive 
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
              : 'text-slate-600 hover:bg-orange-50 hover:text-orange-600'
            }`}
        >
          {item.icon}
          {item.label}
        </Link>
      ) : (
        <div key={item.id} className="space-y-1">
          <button
            onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all
              ${activeDropdown === item.id 
                ? 'bg-slate-100 text-slate-800' 
                : 'text-slate-600 hover:bg-orange-50 hover:text-orange-600'
              }`}
          >
            {item.icon}
            {item.label}
            <ChevronDown size={16} className={`ml-auto transition-transform duration-200 ${activeDropdown === item.id ? 'rotate-180 text-orange-500' : ''}`} />
          </button>
          
          {activeDropdown === item.id && (
            <div className="ml-4 pl-4 border-l-2 border-slate-100 space-y-1 my-2 animate-in slide-in-from-left-2 fade-in duration-200">
              {item.modules.filter(m => canAccessRoute(m.path, item.id)).map((module) => (
                <Link
                  key={module.path}
                  to={module.path}
                  onClick={() => { setMobileMenuOpen(false); setActiveDropdown(null); }}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium transition-all
                    ${location.pathname === module.path 
                      ? 'text-orange-600 bg-orange-50 border border-orange-100' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                >
                  {module.icon}
                  {module.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    })}
  </nav>
);

export default Navbar;
