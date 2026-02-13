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
  LogOut, ChevronDown, Clock
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [modulesConfig, setModulesConfig] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

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
    // Si no existe en la config, asumimos true por defecto
    return modulesConfig[moduleId] !== false;
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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm font-sans">
      <div className="max-w-[1920px] mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-4 min-w-fit">
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              C.C.O
              {isSyncing && <Loader2 size={14} className="animate-spin text-green-500" />}
              {!isSyncing && !loading && <span className="w-2 h-2 bg-green-500 rounded-full" title="Sincronización en tiempo real activa"></span>}
            </span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Centro Control Operacional</span>
          </div>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden lg:flex items-center gap-1 mx-4">
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
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${location.pathname === item.path 
                        ? 'bg-slate-100 text-slate-900' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ) : (
                  <button 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-default
                      ${activeDropdown === item.id 
                        ? 'bg-slate-100 text-slate-900' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    {item.icon}
                    {item.label}
                    <ChevronDown size={14} className="opacity-50" />
                  </button>
                )}

                {/* Dropdown Menu */}
                {!item.isLink && activeDropdown === item.id && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {item.modules.map((module) => (
                      <Link
                        key={module.path}
                        to={module.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                          ${location.pathname === module.path
                            ? 'bg-orange-50 text-orange-700 font-medium'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                      >
                        <span className={location.pathname === module.path ? 'text-orange-500' : 'text-slate-400'}>
                          {module.icon}
                        </span>
                        {module.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-4 min-w-fit">
          {/* User Profile */}
          {user && (
            <div className="hidden xl:flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md shadow-orange-200">
                {user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 leading-none capitalize">{user.nombre}</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase mt-0.5">{user.rol}</span>
              </div>
            </div>
          )}

          <div className="hidden md:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full text-blue-600 text-xs font-bold border border-blue-100">
            <Clock size={14} />
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}
          </div>

          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-red-200 transition-colors">
            <LogOut size={16} />
            Salir
          </button>
        </div>

      </div>
    </header>
  );
};

export default Navbar;