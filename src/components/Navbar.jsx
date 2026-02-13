import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { 
  LayoutDashboard, Map, Satellite, Users, Smartphone, Loader2,
  ArrowDownToLine, Truck, PackagePlus, 
  ArrowUpFromLine, FileText, Hand, Package, Ship, 
  Warehouse, MapPin, ArrowLeftRight, 
  Search, Barcode, MapPinned, 
  Settings, Shield, Layers, FileBarChart,
  LogOut, ChevronDown, Clock, Menu, X, Lock
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission, permissions, isSyncing: authSyncing } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [modulesConfig, setModulesConfig] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };


  // Cargar configuración de módulos desde BD
  useEffect(() => {
    fetchModulesConfig();

    // REALTIME: Escuchar cambios en tms_modules_config
    const channel = supabase
      .channel('tms_modules_config_navbar')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tms_modules_config'
        },
        (payload) => {
          console.log('🔄 Cambio en módulos del navbar (Realtime):', payload);
          setIsSyncing(true);
          fetchModulesConfig();
          setTimeout(() => setIsSyncing(false), 300);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const fetchModulesConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('tms_modules_config')
        .select('id, enabled');
      
      if (error) throw error;

      const config = {};
      if (data) {
        data.forEach(m => {
          config[m.id] = m.enabled;
        });
      }
      setModulesConfig(config);
    } catch (err) {
      console.error('Error fetching modules config:', err);
    } finally {
      setLoading(false);
    }
  };

  const isEnabled = (moduleId) => {
    // 1. Verificar que el módulo esté habilitado en la configuración
    const configEnabled = modulesConfig[moduleId] !== false;
    
    // 2. Para admin, solo se muestra si tiene permiso view_admin o es ADMIN
    if (moduleId === 'admin') {
      return configEnabled && (user?.rol === 'ADMIN' || hasPermission('view_admin'));
    }
    
    // 3. Para otros módulos, se muestran si está habilitado
    // Los permisos específicos se validan a nivel de sub-módulos
    return configEnabled;
  };

  // Verificar si el usuario puede ver un module específico dentro de una sección
  const canAccessModule = (moduleId, sectionId) => {
    // Admin solo accede si es rol ADMIN
    if (sectionId === 'admin') {
      return user?.rol === 'ADMIN';
    }
    
    // Por ahora, si el módulo está habilitado, se puede acceder
    // En el futuro, aquí se agregaría lógica más granular de permisos
    return true;
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
      path: '/dashboard',
      isLink: true
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
        { label: 'Lotes/Series', path: '/queries/batches', icon: <Barcode size={16} /> },
        { label: 'Estado N.V', path: '/queries/sales-status', icon: <FileText size={16} /> },
        { label: 'Direcciones', path: '/queries/addresses', icon: <MapPin size={16} /> },
        { label: 'Ubicaciones', path: '/queries/locations', icon: <MapPinned size={16} /> },
        { label: 'Historial N.V.', path: '/queries/historial-nv', icon: <FileText size={16} /> }
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
        { label: 'Reportes', path: '/admin/reports', icon: <FileBarChart size={16} /> }
      ]
    }
  ];

  return (
    <header className="bg-white border-b-2 border-orange-200 sticky top-0 z-50 shadow-md font-poppins">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-fit">
          <div className="flex flex-col leading-tight">
            <span className="text-lg sm:text-2xl font-black text-orange-600 tracking-tighter flex items-center gap-2">
              C.C.O
              {(isSyncing || authSyncing) && <Loader2 size={14} className="animate-spin text-green-500" />}
              {!isSyncing && !authSyncing && !loading && <span className="w-2 h-2 bg-green-500 rounded-full" title="Permisos y módulos sincronizados"></span>}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-orange-500 uppercase tracking-widest">WMS</span>
          </div>
        </div>

        {/* Center: Navigation - Desktop */}
        <nav className="hidden lg:flex items-center gap-0.5 mx-2">
          {menuConfig.map((item) => {
            // Filtrar por módulos habilitados
            if (!isEnabled(item.id)) return null;

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

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-fit">
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

          <div className="hidden sm:flex items-center gap-1.5 bg-blue-50 px-2.5 py-1.5 rounded-full text-blue-600 text-xs font-bold border border-blue-100">
            <Clock size={12} />
            <span className="hidden sm:inline">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}</span>
          </div>

          <button onClick={handleLogout} className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-150 active:scale-95">
            <LogOut size={16} />
            <span className="hidden xs:inline">Salir</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-orange-50 rounded-lg transition-colors duration-150"
          >
            {mobileMenuOpen ? (
              <X size={20} className="text-slate-700" />
            ) : (
              <Menu size={20} className="text-slate-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <nav className="lg:hidden bg-white border-b-2 border-orange-100 px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
          {menuConfig.map((item) => {
            if (!isEnabled(item.id)) return null;
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