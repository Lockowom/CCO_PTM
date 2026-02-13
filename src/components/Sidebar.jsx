import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import { 
  LayoutDashboard, 
  Map, 
  Satellite, 
  Users, 
  Smartphone, 
  ArrowDownToLine, 
  Truck, 
  PackagePlus, // Reemplazo de DollyChart (no existe en lucide-react)
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
  Timer
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({});
  const [modulesConfig, setModulesConfig] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModulesConfig();

    // REALTIME: Escuchar cambios en tms_modules_config
    const channel = supabase
      .channel('tms_modules_config_sidebar')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tms_modules_config'
        },
        (payload) => {
          console.log('🔄 Cambio en módulos del sidebar (Realtime):', payload);
          fetchModulesConfig();
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
    // Para módulos individuales (ej: 'tms-dashboard'), verificar su sección padre
    if (moduleId.includes('-')) {
      const parentSection = moduleId.split('-')[0]; // 'tms' de 'tms-dashboard'
      return modulesConfig[parentSection] !== false;
    }
    // Para secciones principales, permitir por defecto si no está explícitamente deshabilitada
    return modulesConfig[moduleId] !== false;
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

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
        { id: 'reports', label: 'Reportes', icon: <FileBarChart size={18} />, path: '/admin/reports' }
      ]
    }
  ];

  return (
    <aside className="bg-slate-900 text-white w-64 flex-shrink-0 hidden md:flex flex-col h-screen overflow-y-auto border-r border-slate-700">
      <div className="p-6 border-b border-slate-700 flex flex-col items-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-lg border-2 border-slate-600">
           <img src="https://i.imgur.com/YJh67CY.png" alt="Logo" className="w-10 h-10 object-contain" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">TMS CCO</h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Control Logístico</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuConfig.map((area) => {
          if (!isEnabled(area.id)) return null;

          return (
            <div key={area.id} className="mb-2">
              {area.isLink ? (
                <Link 
                  to={area.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    location.pathname === area.path 
                      ? 'bg-slate-800 text-white border-l-4 border-indigo-500' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className={`${location.pathname === area.path ? area.color : 'text-slate-500 group-hover:text-white'}`}>
                    {area.icon}
                  </span>
                  <span className="font-medium text-sm">{area.label}</span>
                </Link>
              ) : (
                <div>
                  <button 
                    onClick={() => toggleSection(area.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                      expandedSections[area.id] ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`${expandedSections[area.id] ? area.color : 'text-slate-500 group-hover:text-white'}`}>
                        {area.icon}
                      </span>
                      <span className="font-medium text-sm">{area.label}</span>
                    </div>
                    {expandedSections[area.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {/* Dropdown Items */}
                  {expandedSections[area.id] && (
                    <div className="ml-4 mt-1 pl-4 border-l border-slate-700 space-y-1">
                      {area.modules.map((module) => {
                        if (!isEnabled(module.id)) return null;
                        return (
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
                        );
                      })}
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
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin Usuario</p>
            <p className="text-xs text-slate-400 truncate">Administrador</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
