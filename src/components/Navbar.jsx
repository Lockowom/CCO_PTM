import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { useSyncQueueCount } from '../hooks/useSyncQueueCount';
import {
  LayoutDashboard, Map, Satellite, Users, Smartphone,
  ArrowDownToLine, Truck,
  ArrowUpFromLine, FileText, Hand, Package, Ship,
  Warehouse, MapPin, ArrowLeftRight,
  Search, Barcode, MapPinned,
  Settings, Shield, Layers, FileBarChart,
  LogOut, ChevronDown, Menu, X, Lock, Upload, RefreshCw,
  Clock, Timer, Trash2, MessageSquare, History, ClipboardCheck, Eye, RotateCcw, Activity, Siren, FileSearch, Anchor, TrendingUp, Monitor, Scan,
  Scale, CloudOff, ChevronRight, CircleDot, Bell, User, Globe, ScanLine
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ROUTE_PERMISSIONS } from '../constants/permissions';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);

  const { user, logout, hasPermission, landingPage } = useAuth();
  const { isModuleEnabled } = useConfig();
  const syncQueueCount = useSyncQueueCount();

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // ¿El usuario puede acceder a esta ruta? Fuente única: ROUTE_PERMISSIONS.
  const canAccessRoute = (path, sectionId) => {
    if (user?.rol === 'ADMIN') return true;
    if (sectionId === 'admin') return false; // sección admin: solo ADMIN
    const perms = ROUTE_PERMISSIONS[path];
    // Sin permiso definido → DENEGAR por defecto (no mostrar lo no autorizado)
    if (!perms || perms.length === 0) return false;
    const permList = Array.isArray(perms) ? perms : [perms];
    return permList.some(perm => hasPermission(perm));
  };

  // Un módulo/sección del navbar se muestra si está habilitado (Vistas) y el usuario
  // puede acceder a AL MENOS una de sus rutas. La visibilidad queda SIEMPRE derivada de
  // los permisos por ruta → se sincroniza sola al agregar/quitar módulos o permisos.
  const isModuleVisible = (item) => {
    if (!isModuleEnabled(item.id)) return false;
    if (item.id === 'admin') return user?.rol === 'ADMIN';
    if (item.isLink) return canAccessRoute(item.path, item.id);
    return (item.modules || []).some(m => canAccessRoute(m.path, item.id));
  };

  const menuCategories = [
    {
      id: 'core',
      title: "Core",
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <Activity size={18} />, isLink: true, path: '/dashboard' },
        { id: 'tms', label: 'TMS Logistics', icon: <Map size={18} />, modules: [
            { label: 'Dashboard TMS', path: '/tms/dashboard', icon: <LayoutDashboard size={16} /> },
            { label: 'Planificar Rutas', path: '/tms/planning', icon: <MapPinned size={16} /> },
            { label: 'Torre de Control', path: '/tms/control-tower', icon: <Satellite size={16} /> },
            { label: 'Gestión Patios', path: '/tms/yard', icon: <Anchor size={16} /> },
            { label: 'Conductores', path: '/tms/drivers', icon: <Users size={16} /> },
            { label: 'App Móvil', path: '/tms/mobile', icon: <Smartphone size={16} /> },
            { label: 'PDA Operativa', path: '/mobile/pda', icon: <Scan size={16} /> }
          ]
        },
      ]
    },
    {
      id: 'wms',
      title: "Operaciones WMS",
      items: [
        { id: 'inbound', label: 'Inbound', icon: <ArrowDownToLine size={18} />, modules: [
            { label: 'Recepción Importaciones', path: '/inbound/reception', icon: <ClipboardCheck size={16} /> },
            { label: 'Cubicaje', path: '/inbound/cubing', icon: <Scale size={16} /> },
            { label: 'Putaway', path: '/inbound/entry', icon: <ArrowDownToLine size={16} /> },
            { label: 'Carga Masiva', path: '/inbound/data-import', icon: <Upload size={16} /> }
          ]
        },
        { id: 'outbound', label: 'Outbound', icon: <ArrowUpFromLine size={18} />, modules: [
            { label: 'Notas de Venta', path: '/outbound/sales-orders', icon: <FileText size={16} /> },
            { label: 'Picking', path: '/outbound/picking', icon: <Hand size={16} /> },
            { label: 'Packing', path: '/outbound/packing', icon: <Package size={16} /> },
            { label: 'Monitor TV', path: '/outbound/packing-tv', icon: <Monitor size={16} /> },
            { label: 'Despachos', path: '/outbound/shipping', icon: <Ship size={16} /> }
          ]
        }
      ]
    },
    {
      id: 'intelligence',
      title: "Inteligencia",
      items: [
        { id: 'queries', label: 'Consultas', icon: <Search size={18} />, modules: [
            { label: 'Lotes/Series', path: '/queries/batches', icon: <Barcode size={16} /> },
            { label: 'Ficha Técnica', path: '/queries/datasheet', icon: <ScanLine size={16} /> },
            { label: 'Mapa Calor', path: '/queries/heatmap', icon: <Activity size={16} /> },
            { label: 'Ubicaciones', path: '/queries/locations', icon: <MapPin size={16} /> },
            { label: 'Historial N.V.', path: '/queries/historial-nv', icon: <FileSearch size={16} /> },
            { label: 'Estado N.V.', path: '/queries/sales-status', icon: <History size={16} /> },
            { label: 'Control Despacho', path: '/queries/dispatch-control', icon: <ClipboardCheck size={16} /> },
            { label: 'Direcciones', path: '/queries/addresses', icon: <Globe size={16} /> }
          ]
        }
      ]
    },
    {
      id: 'system',
      title: "Sistema",
      items: [
        { id: 'admin', label: 'Configuración', icon: <Settings size={18} />, modules: [
            { label: 'Usuarios', path: '/admin/users', icon: <Users size={16} /> },
            { label: 'Roles', path: '/admin/roles', icon: <Lock size={16} /> },
            { label: 'Vistas', path: '/admin/views', icon: <Layers size={16} /> },
            { label: 'Tickets TI', path: '/admin/tickets', icon: <MessageSquare size={16} /> },
            { label: 'Historial Cargas', path: '/admin/upload-history', icon: <History size={16} /> },
            { label: 'Gestión Ubicaciones', path: '/admin/locations', icon: <MapPin size={16} /> },
            { label: 'Monitor', path: '/admin/monitor', icon: <Activity size={16} /> },
            { label: 'Limpieza', path: '/admin/cleanup', icon: <Trash2 size={16} /> }
          ]
        }
      ]
    }
  ];

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  useGSAP(() => {
    if (activeDropdown) {
      gsap.fromTo(`.dropdown-${activeDropdown}`, 
        { opacity: 0, y: 10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }
      );
    }
  }, [activeDropdown]);

  return (
    <header 
      ref={navRef}
      className={`fixed top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 z-[100] transition-all duration-700 ease-in-out
        ${scrolled ? 'py-0.5 sm:py-1' : 'py-1.5 sm:py-3'}`}
    >
      <div className={`max-w-[1600px] mx-auto px-3 sm:px-6 flex items-center justify-between rounded-2xl sm:rounded-[2rem] border transition-all duration-700 ease-in-out
        ${scrolled 
          ? 'bg-white border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)]' 
          : 'bg-white/80 backdrop-blur-md border-white/20 shadow-sm'}`}>
        
        {/* Left: Logo & Brand */}
        <Link to={landingPage || "/dashboard"} className="flex items-center gap-2 sm:gap-4 group py-1.5 sm:py-2">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300" />
            <div className="relative w-8 h-8 sm:w-11 sm:h-11 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg sm:rounded-xl flex items-center justify-center shadow-2xl border border-white/10 group-hover:scale-105 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.15)_0%,transparent_70%)]" />
              <img
                src="https://i.imgur.com/YJh67CY.png"
                alt="CCO"
                className="w-5 h-5 sm:w-7 sm:h-7 object-contain relative z-10 transition-all duration-500 group-hover:rotate-[10deg] group-hover:scale-110"
                style={{ filter: 'brightness(0) invert(1) drop-shadow(0 0 8px rgba(249,115,22,0.5))' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://cdn-icons-png.flaticon.com/512/2271/2271062.png";
                }}
              />
            </div>
          </div>
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tighter">CCO</span>
              <span className="px-1 sm:px-1.5 py-0.5 bg-orange-500 text-white text-[8px] sm:text-[10px] font-black rounded-md tracking-widest uppercase">System</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 hidden sm:block">Centro Control Operacional</span>
          </div>
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1">
          {menuCategories.map((category) => {
            const visibleItems = category.items.filter(isModuleVisible);
            if (visibleItems.length === 0) return null;

            return visibleItems.map((item) => {
              const isActive = (item.path && location.pathname.startsWith(item.path)) || (item.modules && item.modules.some(m => location.pathname === m.path));
              const isOpen = activeDropdown === item.id;

              return (
                  <div 
                    key={item.id} 
                    className="relative py-2"
                    onMouseEnter={() => !item.isLink && setActiveDropdown(item.id)}
                    onMouseLeave={() => !item.isLink && setActiveDropdown(null)}
                  >
                    {item.isLink ? (
                      <Link
                        to={item.path}
                        className={`group/link relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all overflow-hidden
                          ${isActive ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                      >
                        {/* Active Glow */}
                        {isActive && (
                          <div className="absolute inset-0 bg-orange-500/5 blur-xl animate-pulse" />
                        )}
                        <div className={`transition-transform duration-300 group-hover/link:scale-110 ${isActive ? 'text-orange-500' : ''}`}>
                          {item.icon}
                        </div>
                        <span className="relative z-10">{item.label}</span>
                        {isActive && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-orange-500 rounded-full" />}
                      </Link>
                    ) : (
                      <>
                        <button
                          className={`group/btn relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all outline-none overflow-hidden
                            ${isActive ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                            ${isOpen ? 'bg-slate-50 text-slate-900' : ''}`}
                        >
                          <div className={`transition-transform duration-300 group-hover/btn:scale-110 ${isActive ? 'text-orange-500' : ''}`}>
                            {item.icon}
                          </div>
                          <span className="relative z-10">{item.label}</span>
                          <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                          {isActive && !isOpen && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-orange-500 rounded-full" />}
                        </button>

                        {/* Dropdown Menu - Con área de puente para evitar cierres accidentales */}
                        {isOpen && (
                          <div className={`absolute top-full left-0 pt-2 w-72 z-50 dropdown-${item.id}`}>
                            <div className="bg-white rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] border border-slate-100 p-3 overflow-hidden">
                              <div className="grid grid-cols-1 gap-1.5">
                                {item.modules.filter(m => canAccessRoute(m.path, item.id)).map((module) => (
                                  <Link
                                    key={module.path}
                                    to={module.path}
                                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group/item
                                      ${location.pathname === module.path 
                                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-xl shadow-orange-200' 
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                  >
                                    <div className={`p-2 rounded-lg transition-colors
                                      ${location.pathname === module.path 
                                        ? 'bg-white/20 text-white' 
                                        : 'bg-orange-50 text-orange-500 group-hover/item:bg-orange-100'}`}>
                                      {module.icon}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-black tracking-tight">{module.label}</span>
                                      {location.pathname !== module.path && (
                                        <span className="text-[10px] font-bold text-slate-400 group-hover/item:text-slate-500 transition-colors uppercase tracking-widest">Acceso Directo</span>
                                      )}
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
              );
            });
          })}
        </nav>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* Sync Queue */}
          {syncQueueCount > 0 && (
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200 animate-bounce" title="Sincronización pendiente">
              <RefreshCw size={18} className="animate-spin" />
            </div>
          )}

          {/* User Profile Dropdown (Simplified) */}
          <div className="relative group">
            <button className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-black text-xs">
                {user?.nombre?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col items-start leading-none mr-1">
                <span className="text-xs font-black text-slate-900">{user?.nombre?.split(' ')[0]}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user?.rol}</span>
              </div>
              <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
            </button>

            {/* User Dropdown Content */}
            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
              <div className="px-4 py-3 border-b border-slate-50 mb-1">
                <p className="text-sm font-black text-slate-900 truncate">{user?.nombre}</p>
                <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">{user?.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all text-sm font-black"
              >
                <LogOut size={18} /> Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`xl:hidden p-2 rounded-xl transition-all duration-300 relative w-10 h-10 flex items-center justify-center
            ${mobileMenuOpen ? 'bg-orange-50 text-orange-600 rotate-90' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <div className="relative w-6 h-6">
            <Menu 
              size={24} 
              className={`absolute inset-0 transition-all duration-300 transform ${mobileMenuOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} 
            />
            <X 
              size={24} 
              className={`absolute inset-0 transition-all duration-300 transform ${mobileMenuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} 
            />
          </div>
        </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div 
        className={`xl:hidden fixed inset-0 z-[90] transition-all duration-500 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop con desenfoque */}
        <div 
          className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Contenido del Menú (Drawer) */}
        <div
          className={`absolute right-2 sm:right-4 top-[60px] sm:top-[85px] bottom-2 sm:bottom-4 w-[calc(100%-16px)] sm:w-[calc(100%-32px)] max-w-[280px] sm:max-w-[320px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col transition-all duration-500 ease-out
            ${mobileMenuOpen ? 'translate-x-0 scale-100' : 'translate-x-8 scale-95'}`}
        >
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 pb-20 space-y-4 sm:space-y-6">
            {menuCategories.map((category) => {
              const visibleItems = category.items.filter(isModuleVisible);
              if (visibleItems.length === 0) return null;

              return (
                <div key={category.id} className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">
                    {category.title}
                  </h3>
                  <div className="space-y-1">
                    {visibleItems.map((item) => {
                      const isExpanded = activeDropdown === item.id;
                      const isActive = item.path ? location.pathname.startsWith(item.path) : (item.modules && item.modules.some(m => location.pathname === m.path));

                      return item.isLink ? (
                        <Link
                          key={item.id}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all
                            ${isActive ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          <div className={`${isActive ? 'text-orange-500' : 'text-slate-400'}`}>
                            {item.icon}
                          </div>
                          <span className="text-sm">{item.label}</span>
                        </Link>
                      ) : (
                        <div key={item.id} className={`rounded-2xl transition-all ${isExpanded ? 'bg-slate-50/80 p-1' : ''}`}>
                          <button
                            onClick={() => toggleDropdown(item.id)}
                            className={`w-full flex items-center justify-between px-4 py-3.5 font-bold transition-all rounded-xl
                              ${isExpanded ? 'text-orange-600' : 'text-slate-600 hover:bg-slate-50'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`${isExpanded ? 'text-orange-500' : 'text-slate-400'}`}>
                                {item.icon}
                              </div>
                              <span className="text-sm">{item.label}</span>
                            </div>
                            <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {isExpanded && (
                            <div className="mt-1 space-y-1 px-1 pb-1 animate-in fade-in slide-in-from-top-2 duration-300">
                              {item.modules.filter(m => canAccessRoute(m.path, item.id)).map((module) => (
                                <Link
                                  key={module.path}
                                  to={module.path}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all
                                    ${location.pathname === module.path 
                                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
                                      : 'text-slate-500 hover:text-orange-600 hover:bg-white'}`}
                                >
                                  {module.icon} {module.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
