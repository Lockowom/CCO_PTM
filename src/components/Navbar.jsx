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
  Clock, Timer, Trash2, MessageSquare, History, ClipboardCheck, Eye, RotateCcw, Activity, Siren, FileSearch, Anchor, TrendingUp, Monitor, Scan,
  Scale
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
    'inbound': ['view_reception', 'view_entry', 'view_returns', 'process_reception', 'manage_data_import'],
    'outbound': ['view_sales_orders', 'view_picking', 'view_packing', 'view_packing_tv', 'view_shipping', 'view_deliveries'],
    'inventory': ['view_stock', 'view_layout', 'view_transfers', 'view_cycle_count'],
    'quality': ['view_quality'],
    'analytics': ['view_reports', 'view_tv_mode'],
    'queries': ['view_batches', 'view_sales_status', 'view_addresses', 'view_locations', 'view_historial_nv', 'view_dispatch_control', 'view_kardex', 'view_productivity'],
    'admin': ['manage_users', 'manage_roles', 'manage_views', 'manage_reports', 'admin_upload_history']
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
    '/inbound/returns': 'view_returns',
    '/inbound/entry': 'view_entry',
    '/inbound/cubing': 'process_reception',
    '/inbound/data-import': 'manage_data_import',
    '/outbound/sales-orders': 'view_sales_orders',
    '/outbound/picking': 'view_picking',
    '/outbound/packing': 'view_packing',
    '/outbound/packing-tv': 'view_packing_tv',
    '/outbound/shipping': 'view_shipping',
    '/outbound/deliveries': 'view_deliveries',
    '/inventory/dashboard': 'view_stock',
    '/inventory/stock': 'view_stock',
    '/inventory/layout': 'view_layout',
    '/inventory/replenishment': 'view_stock',
    '/inventory/transfers': 'view_transfers',
    '/inventory/cycle-count': 'view_cycle_count',
    '/quality/inspection': 'view_quality',
    '/analytics': 'view_reports',
    '/analytics/tv': 'view_tv_mode',
    '/queries/kardex': 'view_kardex',
    '/mobile/pda': 'view_stock',
    '/queries/productivity': 'view_productivity',
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
    '/admin/cleanup': 'manage_cleanup',
    '/admin/time-reports': 'view_time_reports',
    '/admin/tickets': 'manage_tickets',
    '/admin/login-history': 'manage_users',
    '/admin/upload-history': 'admin_upload_history'
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
        { label: 'Cubicaje (Pesos)', path: '/inbound/cubing', icon: <Scale size={16} /> },
        { label: 'Devoluciones', path: '/inbound/returns', icon: <RotateCcw size={16} /> },
        { label: 'Ingreso (Putaway)', path: '/inbound/entry', icon: <ArrowDownToLine size={16} /> },
        { label: 'Carga Masiva', path: '/inbound/data-import', icon: <Upload size={16} /> }
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
        { label: 'Monitor TV', path: '/outbound/packing-tv', icon: <Monitor size={16} /> },
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
        { label: 'Historial de Cargas', path: '/admin/upload-history', icon: <Upload size={16} /> },
        { label: 'Reportes', path: '/admin/reports', icon: <FileBarChart size={16} /> },
        { label: 'Tiempos', path: '/admin/time-reports', icon: <Clock size={16} /> },
        { label: 'Soporte TI', path: '/admin/tickets', icon: <MessageSquare size={16} /> },
        { label: 'Limpieza', path: '/admin/cleanup', icon: <Trash2 size={16} /> }
      ]
    }
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 sm:px-8 py-3 gap-4 max-w-[1920px] mx-auto">
        {/* 1. Logo Section (Flexible, no se achica) */}
        <Link to="/dashboard" className="flex items-center gap-2 min-w-fit shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 p-2 transform transition-transform hover:scale-105">
            <img src="https://i.imgur.com/YJh67CY.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-lg font-black text-slate-800 leading-none tracking-tight">C.C.O</h1>
            <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest">Centro Control</p>
          </div>
        </Link>

        {/* 2. Desktop Navigation (Se oculta progresivamente) */}
        <nav className="hidden xl:flex items-center gap-1 flex-1 justify-center px-2">
          {menuConfig.map((item) => {
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
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                      ${location.pathname === item.path
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <button
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap
                      ${activeDropdown === item.id
                        ? 'bg-orange-50 text-orange-600 shadow-sm ring-1 ring-orange-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    <ChevronDown size={14} className={`transition-transform duration-150 ${activeDropdown === item.id ? 'rotate-180' : ''}`} />
                  </button>
                )}

                {/* Dropdown (Mejorado z-index) */}
                {!item.isLink && activeDropdown === item.id && (
                  <div className="absolute top-[calc(100%+0.5rem)] left-0 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-[60] animate-in fade-in slide-in-from-top-2">
                    {(item.modules || []).filter(m => canAccessRoute(m.path, item.id)).map((module) => (
                      <Link
                        key={module.path}
                        to={module.path}
                        onClick={() => setActiveDropdown(null)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                            ${location.pathname === module.path
                            ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                      >
                        <span>{module.icon}</span>
                        {module.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* 3. Right Section (Widgets siempre visibles o colapsables) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Tablet/Desktop: User & Clock */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm" title={isOnline ? "Conectado a Internet" : "Sin Conexión"}>
              <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isOnline ? 'text-emerald-700' : 'text-red-700'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <ClockWidget />
            {user && (
              <div className="flex items-center gap-3 bg-white pl-2 pr-4 py-1.5 rounded-full border border-slate-200 shadow-sm cursor-pointer hover:border-orange-300 transition-colors group">
                <div className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-900 group-hover:from-orange-500 group-hover:to-amber-600 rounded-full flex items-center justify-center text-white font-black text-sm shadow-sm transition-all">
                  {user.nombre?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden xl:block text-right pr-2">
                  <p className="text-[10px] font-black text-slate-700 leading-tight">{user.nombre.split(' ')[0]}</p>
                  <p className="text-[8px] font-bold text-orange-500 uppercase leading-none">{user.rol}</p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Toggle (Visible < xl) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logout (Siempre visible en desktop grande, oculto en mobile) */}
          <button
            onClick={handleLogout}
            className="hidden sm:flex p-2.5 text-slate-400 hover:text-white hover:bg-red-500 rounded-xl transition-all shadow-sm hover:shadow-md"
            title="Salir"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>


      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200">
          <MobileMenu
            menuConfig={menuConfig}
            isSectionVisible={isSectionVisible}
            canAccessRoute={canAccessRoute}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            setMobileMenuOpen={setMobileMenuOpen}
            location={location}
          />
        </div>
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
  <nav className="xl:hidden bg-slate-50/50 px-4 py-6 space-y-3 max-h-[85vh] overflow-y-auto">
    {menuConfig.map((item) => {
      if (!isSectionVisible(item.id)) return null;

      const isActive = location.pathname === item.path;

      return item.isLink ? (
        <Link
          key={item.id}
          to={item.path}
          onClick={() => setMobileMenuOpen(false)}
          className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black uppercase tracking-wider transition-all
            ${isActive
              ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
            }`}
        >
          {item.icon}
          {item.label}
        </Link>
      ) : (
        <div key={item.id} className="space-y-1">
          <button
            onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black uppercase tracking-wider transition-all shadow-sm
              ${activeDropdown === item.id
                ? 'bg-orange-50 text-orange-600 border border-orange-200 ring-2 ring-orange-500/20'
                : 'bg-white text-slate-600 border border-slate-200'
              }`}
          >
            {item.icon}
            {item.label}
            <ChevronDown size={16} className={`ml-auto transition-transform duration-200 ${activeDropdown === item.id ? 'rotate-180 text-orange-500' : ''}`} />
          </button>

          {activeDropdown === item.id && (
            <div className="ml-4 pl-4 border-l-2 border-slate-100 space-y-1 my-2 animate-in slide-in-from-left-2 fade-in duration-200">
              {(item.modules || []).filter(m => canAccessRoute(m.path, item.id)).map((module) => (
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
