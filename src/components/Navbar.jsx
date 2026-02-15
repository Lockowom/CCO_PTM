import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import {
  LayoutDashboard, Map, Satellite, Users, Smartphone,
  ArrowDownToLine, Truck, PackagePlus,
  ArrowUpFromLine, FileText, Hand, Package, Ship,
  Warehouse, MapPin, ArrowLeftRight,
  Search, Barcode, MapPinned,
  Settings, Shield, Layers, FileBarChart,
  LogOut, ChevronDown, Menu, X, Lock, Upload, RefreshCw
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // USAR CONTEXTOS COMPARTIDOS
  const { user, logout, hasPermission, permissions, refreshPermissions } = useAuth();
  const { isModuleEnabled, refreshConfig } = useConfig();
  
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Debug log
  console.log('🔄 Navbar render - User:', user?.nombre, '| Permisos:', permissions?.length);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Refrescar manualmente
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshPermissions(), refreshConfig()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Permisos por sección
  const SECTION_PERMISSIONS = {
    'tms': ['view_routes', 'view_control_tower', 'view_drivers', 'view_mobile_app', 'view_tms_dashboard'],
    'dashboard': ['view_dashboard'],
    'inbound': ['view_reception', 'view_entry'],
    'outbound': ['view_sales_orders', 'view_picking', 'view_packing', 'view_shipping', 'view_deliveries'],
    'inventory': ['view_stock', 'view_layout', 'view_transfers'],
    'queries': ['view_batches', 'view_sales_status', 'view_addresses', 'view_locations', 'view_historial_nv'],
    'admin': ['manage_users', 'manage_roles', 'manage_views', 'manage_reports']
  };

  // Verificar si sección está habilitada
  const isSectionEnabled = (sectionId) => {
    // Verificar módulo habilitado en config
    if (!isModuleEnabled(sectionId)) return false;

    // ADMIN ve todo
    if (user?.rol === 'ADMIN') return true;

    // Para otros roles, verificar permisos
    const requiredPermissions = SECTION_PERMISSIONS[sectionId] || [];
    if (requiredPermissions.length === 0) return true;

    return requiredPermissions.some(perm => hasPermission(perm));
  };

  // Verificar acceso a módulo específico
  const canAccessModule = (modulePath, sectionId) => {
    // Admin solo para rol ADMIN
    if (sectionId === 'admin') return user?.rol === 'ADMIN';

    // ADMIN ve todo
    if (user?.rol === 'ADMIN') return true;

    // Permisos por ruta
    const pathPermissions = {
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
      '/admin/reports': 'manage_reports',
      '/admin/data-import': 'manage_data_import'
    };

    const requiredPermission = pathPermissions[modulePath];
    if (!requiredPermission) return true;

    return hasPermission(requiredPermission);
  };

  const menuConfig = [
    {
      id: 'tms',
      label: 'TMS',
      icon: <Map size={18} />,
      modules: [
        { label: 'Dashboard TMS', path: '/tms/dashboard', icon: <LayoutDashboard size={16} /> },
        { label: 'Planificar Rutas', path: '/tms/planning', icon: <MapPinned size={16} /> },
        { label: 'Torre de Control', path: '/tms/control-tower', icon: <Satellite size={16} /> },
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
        { label: 'Ingreso', path: '/inbound/entry', icon: <PackagePlus size={16} /> }
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
        { label: 'Stock', path: '/inventory/stock', icon: <Package size={16} /> },
        { label: 'Layout', path: '/inventory/layout', icon: <MapPin size={16} /> },
        { label: 'Transferencias', path: '/inventory/transfers', icon: <ArrowLeftRight size={16} /> }
      ]
    },
    {
      id: 'queries',
      label: 'Consultas',
      icon: <Search size={18} />,
      modules: [
        { label: 'Historial N.V.', path: '/queries/historial-nv', icon: <FileText size={16} /> },
        { label: 'Lotes/Series', path: '/queries/batches', icon: <Barcode size={16} /> },
        { label: 'Estado N.V.', path: '/queries/sales-status', icon: <FileText size={16} /> },
        { label: 'Direcciones', path: '/queries/addresses', icon: <MapPin size={16} /> },
        { label: 'Ubicaciones', path: '/queries/locations', icon: <MapPinned size={16} /> }
      ]
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: <Settings size={18} />,
      modules: [
        { label: 'Usuarios', path: '/admin/users', icon: <Users size={16} /> },
        { label: 'Roles', path: '/admin/roles', icon: <Shield size={16} /> },
        { label: 'Vistas', path: '/admin/views', icon: <Layers size={16} /> },
        { label: 'Carga Datos', path: '/admin/data-import', icon: <Upload size={16} /> },
        { label: 'Reportes', path: '/admin/reports', icon: <FileBarChart size={16} /> }
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
        <nav className="hidden lg:flex items-center gap-0.5 sm:gap-1 flex-wrap justify-center flex-1 px-2 sm:px-4">
          {menuConfig.map((item) => {
            // Verificar si la sección está habilitada
            if (!isSectionEnabled(item.id)) return null;

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
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150
                      ${location.pathname === item.path
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'text-slate-700 hover:text-orange-600 hover:bg-orange-50'
                      }`}
                  >
                    {item.icon}
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                ) : (
                  <button
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer group
                      ${activeDropdown === item.id
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'text-slate-700 hover:text-orange-600 hover:bg-orange-50'
                      }`}
                  >
                    {item.icon}
                    <span className="hidden sm:inline">{item.label}</span>
                    <ChevronDown size={14} className={`transition-transform duration-150 ${activeDropdown === item.id ? 'rotate-180' : ''}`} />
                  </button>
                )}

                {/* Dropdown Menu */}
                {!item.isLink && activeDropdown === item.id && (
                  <div className="absolute top-full left-0 mt-0.5 w-48 sm:w-56 bg-white rounded-lg shadow-2xl border-2 border-orange-100 p-2 animate-in fade-in slide-in-from-top-1 duration-100 z-50">
                    {item.modules.filter(module => canAccessModule(module.path, item.id)).length === 0 ? (
                      <div className="px-3 py-4 text-center text-slate-400 text-xs">
                        <Lock size={14} className="mx-auto mb-1" />
                        Sin acceso
                      </div>
                    ) : (
                      item.modules.filter(module => canAccessModule(module.path, item.id)).map((module) => (
                        <Link
                          key={module.path}
                          to={module.path}
                          onClick={() => setActiveDropdown(null)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-150
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

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-fit">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-lg transition-all ${
              isRefreshing 
                ? 'text-green-500 animate-spin' 
                : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50'
            }`}
            title="Actualizar menú"
          >
            <RefreshCw size={18} />
          </button>

          {/* User Profile */}
          {user && (
            <div className="hidden md:flex items-center gap-2 lg:gap-3 pl-3 lg:pl-4 border-l-2 border-orange-200">
              <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs lg:text-sm shadow-lg">
                {user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col hidden lg:block">
                <span className="text-sm font-bold text-slate-800 leading-none capitalize">{user.nombre}</span>
                <span className="text-[10px] font-semibold text-orange-500 uppercase mt-0.5">{user.rol}</span>
              </div>
            </div>
          )}

          {/* Clock */}
          {(() => {
            const [now, setNow] = React.useState(new Date());
            React.useEffect(() => {
              const timer = setInterval(() => setNow(new Date()), 1000);
              return () => clearInterval(timer);
            }, []);
            const h = now.getHours();
            const m = now.getMinutes().toString().padStart(2, '0');
            const s = now.getSeconds().toString().padStart(2, '0');
            const h24 = h.toString().padStart(2, '0');
            const ampm = h < 12 ? 'AM' : 'PM';
            const day = now.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }).toUpperCase();
            return (
              <div className="hidden sm:flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 shadow-inner">
                <div className="flex items-baseline gap-0.5">
                  <span className="font-mono text-sm font-black text-emerald-400 tracking-wider">{h24}:{m}</span>
                  <span className="font-mono text-[10px] text-emerald-400/60">{s}</span>
                </div>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${ampm === 'AM' ? 'bg-sky-500/20 text-sky-400' : 'bg-amber-500/20 text-amber-400'}`}>{ampm}</span>
                <div className="w-px h-4 bg-slate-700" />
                <span className="text-[10px] font-bold text-slate-400 tracking-wide">{day}</span>
              </div>
            );
          })()}

          <button onClick={handleLogout} className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-150 active:scale-95">
            <LogOut size={16} />
            <span className="hidden xs:inline">Salir</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-orange-50 rounded-lg transition-colors duration-150"
          >
            {mobileMenuOpen ? <X size={20} className="text-slate-700" /> : <Menu size={20} className="text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="lg:hidden bg-white border-b-2 border-orange-100 px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
          {menuConfig.map((item) => {
            if (!isSectionEnabled(item.id)) return null;
            
            return item.isLink ? (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-orange-100 hover:text-orange-700 transition-colors"
              >
                {item.icon}
                {item.label}
              </Link>
            ) : (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-orange-100 hover:text-orange-700 transition-colors"
                >
                  {item.icon}
                  {item.label}
                  <ChevronDown size={14} className={`ml-auto transition-transform ${activeDropdown === item.id ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === item.id && (
                  <div className="ml-2 space-y-1 animate-in fade-in duration-100">
                    {item.modules.filter(module => canAccessModule(module.path, item.id)).length === 0 ? (
                      <div className="px-3 py-2 text-center text-slate-400 text-xs flex items-center justify-center gap-1">
                        <Lock size={12} />
                        Sin acceso
                      </div>
                    ) : (
                      item.modules.filter(module => canAccessModule(module.path, item.id)).map((module) => (
                        <Link
                          key={module.path}
                          to={module.path}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setActiveDropdown(null);
                          }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-orange-500 hover:text-white transition-colors"
                        >
                          {module.icon}
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
      )}
    </header>
  );
};

export default Navbar;
