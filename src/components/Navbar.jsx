import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { useSyncQueueCount } from '../hooks/useSyncQueueCount';
import {
  LayoutDashboard,
  Users,
  ArrowDownToLine,
  FileText,
  Package,
  Warehouse,
  MapPin,
  ArrowLeftRight,
  Search,
  Barcode,
  Settings,
  Shield,
  Layers,
  FileBarChart,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Lock,
  Upload,
  RefreshCw,
  Clock,
  Trash2,
  MessageSquare,
  History,
  ClipboardCheck,
  Activity,
  Siren,
  FileSearch,
  TrendingUp,
  Monitor,
  Scan,
  Scale,
  Globe,
  ScanLine,
  Wrench,
  Sparkles,
  GitBranch,
  Share2,
  Zap,
  KeyRound,
  Tags
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ROUTE_PERMISSIONS, puedeVerTab, TAB_PERMISSIONS } from '../constants/permissions';
import { mostrarNovedades } from './NovedadesModal';
import NotificationBell from './NotificationBell';

// Versión instalada (inyectada por Vite desde package.json).
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);

  const { user, logout, hasPermission } = useAuth();
  const { isModuleEnabled } = useConfig();
  const syncQueueCount = useSyncQueueCount();

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false); // menú de perfil (tap en táctil)
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // ¿El usuario puede acceder a esta ruta? Fuente única: ROUTE_PERMISSIONS.
  // El admin delegado ve lo mismo que ADMIN: el guard de rutas (ProtectedRoute)
  // ya le concede acceso total, así que ocultarle el menú solo desincronizaba
  // ambas fuentes de verdad.
  const esAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado === true;
  const canAccessRoute = (path, sectionId) => {
    if (esAdmin) return true;
    if (sectionId === 'admin') return false; // sección admin: solo ADMIN/delegado
    const [base, query] = String(path).split('?');
    const perms = ROUTE_PERMISSIONS[base];
    // Sin permiso definido → DENEGAR por defecto (no mostrar lo no autorizado)
    if (!perms || perms.length === 0) return false;
    const permList = Array.isArray(perms) ? perms : [perms];
    if (!permList.some((perm) => hasPermission(perm))) return false;
    // Control fino por pestaña: si el item es un deep-link ?tab=… exige el permiso
    // de esa pestaña; el item base (sin ?tab) equivale a la pestaña por defecto.
    const tab = (query && new URLSearchParams(query).get('tab')) || null;
    if (TAB_PERMISSIONS[base])
      return puedeVerTab(hasPermission, base, tab || TAB_PERMISSIONS[base]._default);
    return true;
  };

  // ¿El item del menú corresponde a la pantalla actual? Los items con deep-link
  // (?tab=…) solo están activos si coincide la ruta Y la pestaña; el item base
  // (sin ?tab) solo cuando la URL no trae pestaña. Antes se comparaba solo el
  // pathname y el item base quedaba "encendido" para todas las pestañas
  // (Conteo · Contar se veía activo estando en Ajuste ERP, ídem Post-Venta).
  const esRutaActiva = (path) => {
    const [base, query] = String(path).split('?');
    if (location.pathname !== base) return false;
    const tabItem = query ? new URLSearchParams(query).get('tab') : null;
    const tabActual = new URLSearchParams(location.search).get('tab');
    return (tabItem || null) === (tabActual || null);
  };

  // Un módulo/sección del navbar se muestra si está habilitado (Vistas) y el usuario
  // puede acceder a AL MENOS una de sus rutas. La visibilidad queda SIEMPRE derivada de
  // los permisos por ruta → se sincroniza sola al agregar/quitar módulos o permisos.
  const isModuleVisible = (item) => {
    if (!isModuleEnabled(item.id)) return false;
    if (item.id === 'admin') return esAdmin;
    if (item.isLink) return canAccessRoute(item.path, item.id);
    return (item.modules || []).some((m) => canAccessRoute(m.path, item.id));
  };

  const menuCategories = [
    {
      id: 'wms',
      title: 'Operaciones WMS',
      items: [
        // TMS (Transporte) OCULTO — módulo no operativo; se reactivará cuando esté listo.
        // { id: 'tms', label: 'TMS', icon: <Truck size={18} />, modules: [
        //     { label: 'Torre de Control', path: '/tms/control', icon: <Truck size={16} /> },
        //     { label: 'Mi Ruta (Chofer)', path: '/tms/pda', icon: <Scan size={16} /> }
        //   ]
        // },
        {
          id: 'inbound',
          label: 'Inbound',
          icon: <ArrowDownToLine size={18} />,
          modules: [
            {
              label: 'Recepción Importaciones',
              path: '/inbound/reception',
              icon: <ClipboardCheck size={16} />
            },
            {
              label: 'Recepción Nacionales',
              path: '/inbound/reception-nacional',
              icon: <Package size={16} />
            },
            { label: 'Cubicaje', path: '/inbound/cubing', icon: <Scale size={16} /> },
            { label: 'Putaway', path: '/inbound/entry', icon: <ArrowDownToLine size={16} /> },
            { label: 'Carga Masiva', path: '/inbound/data-import', icon: <Upload size={16} /> }
          ]
        },
        {
          id: 'inventario',
          label: 'Inventario',
          icon: <Warehouse size={18} />,
          modules: [
            { label: 'PDA Operativa (Bodega)', path: '/mobile/pda', icon: <Scan size={16} /> },
            {
              label: 'Traspasos y Ajustes',
              path: '/inventory/traspasos',
              icon: <ArrowLeftRight size={16} />
            },
            { label: 'Mapa de Calor', path: '/queries/heatmap', icon: <Activity size={16} /> },
            {
              label: 'Gestión de Ubicaciones',
              path: '/admin/locations',
              icon: <MapPin size={16} />
            },
            { label: 'Conteo · Contar', path: '/inventory/conteo', icon: <Package size={16} /> },
            {
              label: 'Conteo · Sesiones',
              path: '/inventory/conteo?tab=sesiones',
              icon: <Layers size={16} />
            },
            {
              label: 'Conteo · Conciliación',
              path: '/inventory/conteo?tab=conciliacion',
              icon: <ClipboardCheck size={16} />
            },
            {
              label: 'Conteo · Ajuste ERP',
              path: '/inventory/conteo?tab=ajuste',
              icon: <FileBarChart size={16} />
            },
            {
              label: 'Conteo · Bloques / QR',
              path: '/inventory/conteo?tab=bloques',
              icon: <Scan size={16} />
            },
            {
              label: 'Conteo · Proyección',
              path: '/inventory/conteo?tab=proyeccion',
              icon: <TrendingUp size={16} />
            },
            {
              label: 'Análisis · Resumen',
              path: '/inventory/analisis',
              icon: <FileBarChart size={16} />
            },
            {
              label: 'Análisis · Antiguos c/ Disponible',
              path: '/inventory/analisis?tab=antiguos_disp',
              icon: <Siren size={16} />
            },
            {
              label: 'Análisis · No Activos c/ Stock',
              path: '/inventory/analisis?tab=no_activos_stock',
              icon: <Siren size={16} />
            },
            {
              label: 'Análisis · Duplicados',
              path: '/inventory/analisis?tab=duplicados',
              icon: <Layers size={16} />
            },
            {
              label: 'Análisis · Anomalías',
              path: '/inventory/analisis?tab=anomalias',
              icon: <FileSearch size={16} />
            },
            {
              label: 'Análisis · Detalle completo',
              path: '/inventory/analisis?tab=detalle',
              icon: <FileText size={16} />
            },
            {
              label: 'Carteles de Bodega',
              path: '/inventory/carteles',
              icon: <Monitor size={16} />
            },
            { label: 'Panel de Insumos', path: '/inventory/insumos', icon: <Package size={16} /> }
          ]
        }
      ]
    },
    {
      id: 'intelligence',
      title: 'Inteligencia',
      items: [
        {
          id: 'queries',
          label: 'Consultas',
          icon: <Search size={18} />,
          modules: [
            { label: 'Lotes/Series', path: '/queries/batches', icon: <Barcode size={16} /> },
            { label: 'Ficha Técnica', path: '/queries/datasheet', icon: <ScanLine size={16} /> },
            { label: 'Grupo por SKU', path: '/queries/grupo', icon: <Tags size={16} /> },
            { label: 'Ubicaciones', path: '/queries/locations', icon: <MapPin size={16} /> },
            {
              label: 'Historial N.V.',
              path: '/queries/historial-nv',
              icon: <FileSearch size={16} />
            },
            { label: 'Estado N.V.', path: '/queries/sales-status', icon: <History size={16} /> },
            {
              label: 'Control Despacho',
              path: '/queries/dispatch-control',
              icon: <ClipboardCheck size={16} />
            },
            { label: 'Direcciones', path: '/queries/addresses', icon: <Globe size={16} /> }
          ]
        },
        {
          id: 'quality',
          label: 'Calidad',
          icon: <ClipboardCheck size={18} />,
          modules: [
            { label: 'Monitoreo', path: '/quality/monitoreo', icon: <FileSearch size={16} /> },
            { label: 'Mi Bandeja', path: '/quality/bandeja', icon: <Package size={16} /> },
            {
              label: 'Acciones de Calidad',
              path: '/quality/acciones',
              icon: <ClipboardCheck size={16} />
            },
            {
              label: 'Clasificación de Productos',
              path: '/quality/clasificacion',
              icon: <Tags size={16} />
            }
          ]
        },
        {
          id: 'panel',
          label: 'Panel PTM',
          icon: <LayoutDashboard size={18} />,
          modules: [
            { label: 'Dashboard', path: '/panel', icon: <LayoutDashboard size={16} /> },
            { label: 'Ingresar N.V.', path: '/panel/ingresar', icon: <FileText size={16} /> },
            { label: 'Info N.V.', path: '/panel/info', icon: <FileSearch size={16} /> },
            { label: 'Modo TV', path: '/panel/tv', icon: <Monitor size={16} /> },
            { label: 'Builder', path: '/panel/builder', icon: <Layers size={16} /> },
            { label: 'Configuración', path: '/panel/configuracion', icon: <Settings size={16} /> }
          ]
        }
      ]
    },
    {
      id: 'postventa',
      title: 'Post-Venta',
      items: [
        {
          id: 'postventa',
          label: 'Servicio Técnico',
          icon: <Wrench size={18} />,
          modules: [
            { label: 'Tickets', path: '/postventa/tickets', icon: <ClipboardCheck size={16} /> },
            {
              label: 'Bandeja Correos',
              path: '/postventa/tickets?tab=bandeja',
              icon: <MessageSquare size={16} />
            },
            {
              label: 'Calendario',
              path: '/postventa/tickets?tab=calendario',
              icon: <Clock size={16} />
            },
            {
              label: 'Nuevo Ticket',
              path: '/postventa/tickets?tab=nuevo',
              icon: <FileText size={16} />
            },
            {
              label: 'Dashboard',
              path: '/postventa/tickets?tab=dashboard',
              icon: <LayoutDashboard size={16} />
            },
            {
              label: 'Técnicos',
              path: '/postventa/tickets?tab=tecnicos',
              icon: <Users size={16} />
            }
          ]
        }
      ]
    },
    {
      id: 'system',
      title: 'Sistema',
      items: [
        {
          id: 'admin',
          label: 'Configuración',
          icon: <Settings size={18} />,
          modules: [
            { label: 'Identidad y Seguridad', path: '/admin/users', icon: <Users size={16} /> },
            { label: 'Vistas', path: '/admin/views', icon: <Layers size={16} /> },
            { label: 'Tickets TI', path: '/admin/tickets', icon: <MessageSquare size={16} /> },
            {
              label: 'Historial Cargas',
              path: '/admin/upload-history',
              icon: <History size={16} />
            },
            {
              label: 'Bodegas Softland',
              path: '/admin/bodegas-softland',
              icon: <Package size={16} />
            },
            { label: 'Monitor', path: '/admin/monitor', icon: <Activity size={16} /> },
            { label: 'Observabilidad', path: '/admin/observability', icon: <Shield size={16} /> },
            { label: 'Workflows', path: '/admin/workflows', icon: <GitBranch size={16} /> },
            { label: 'Mapa de Procesos', path: '/admin/flujo-maestro', icon: <Share2 size={16} /> },
            { label: 'Eventos y Notificaciones', path: '/admin/eventos', icon: <Zap size={16} /> },
            { label: 'API de Operaciones', path: '/admin/api', icon: <KeyRound size={16} /> },
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
      gsap.fromTo(
        `.dropdown-${activeDropdown}`,
        { opacity: 0, y: 10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: 'power2.out' }
      );
    }
  }, [activeDropdown]);

  return (
    <header
      ref={navRef}
      className={`fixed top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 z-[100] transition-all duration-700 ease-in-out
        ${scrolled ? 'py-0.5 sm:py-1' : 'py-1.5 sm:py-3'}`}
    >
      <div
        className={`max-w-[1600px] mx-auto px-3 sm:px-6 flex items-center justify-between rounded-2xl sm:rounded-[2rem] border transition-all duration-700 ease-in-out
        ${
          scrolled
            ? 'bg-white border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)]'
            : 'bg-white/80 backdrop-blur-md border-white/20 shadow-sm'
        }`}
      >
        {/* Left: Logo & Brand */}
        <Link to="/" className="flex items-center gap-2 sm:gap-4 group py-1.5 sm:py-2">
          <img
            src="/logo-ptm.png"
            alt="PTM Health Care"
            className="h-7 sm:h-9 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
          />
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tighter">
                CCO
              </span>
              <span className="px-1 sm:px-1.5 py-0.5 bg-orange-500 text-white text-[8px] sm:text-[10px] font-black rounded-md tracking-widest uppercase">
                System
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 hidden sm:block">
              Centro Control Operacional
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1">
          {menuCategories.map((category) => {
            const visibleItems = category.items.filter(isModuleVisible);
            if (visibleItems.length === 0) return null;

            return visibleItems.map((item) => {
              const isActive =
                (item.path && location.pathname.startsWith(item.path)) ||
                (item.modules && item.modules.some((m) => esRutaActiva(m.path)));
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
                      <div
                        className={`transition-transform duration-300 group-hover/link:scale-110 ${isActive ? 'text-orange-500' : ''}`}
                      >
                        {item.icon}
                      </div>
                      <span className="relative z-10">{item.label}</span>
                      {isActive && (
                        <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-orange-500 rounded-full" />
                      )}
                    </Link>
                  ) : (
                    <>
                      <button
                        className={`group/btn relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all outline-none overflow-hidden
                            ${isActive ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                            ${isOpen ? 'bg-slate-50 text-slate-900' : ''}`}
                      >
                        <div
                          className={`transition-transform duration-300 group-hover/btn:scale-110 ${isActive ? 'text-orange-500' : ''}`}
                        >
                          {item.icon}
                        </div>
                        <span className="relative z-10">{item.label}</span>
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        />
                        {isActive && !isOpen && (
                          <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-orange-500 rounded-full" />
                        )}
                      </button>

                      {/* Dropdown Menu - Con área de puente para evitar cierres accidentales.
                            Con scroll (alto máx.) y 2 columnas cuando hay muchos accesos, para
                            que quepan sin tener que reducir el zoom del navegador. */}
                      {isOpen &&
                        (() => {
                          const mods = item.modules.filter((m) => canAccessRoute(m.path, item.id));
                          const many = mods.length > 8;
                          return (
                            <div
                              className={`absolute top-full left-0 pt-2 z-50 dropdown-${item.id} ${many ? 'w-[34rem]' : 'w-72'}`}
                            >
                              <div className="bg-white rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.15)] border border-slate-100 p-2.5 max-h-[78vh] overflow-y-auto">
                                <div
                                  className={`grid gap-1 ${many ? 'grid-cols-2' : 'grid-cols-1'}`}
                                >
                                  {mods.map((module) => (
                                    <Link
                                      key={module.path}
                                      to={module.path}
                                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all group/item
                                      ${
                                        esRutaActiva(module.path)
                                          ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-200'
                                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                      }`}
                                    >
                                      <div
                                        className={`p-1.5 rounded-lg shrink-0 transition-colors
                                      ${
                                        esRutaActiva(module.path)
                                          ? 'bg-white/20 text-white'
                                          : 'bg-orange-50 text-orange-500 group-hover/item:bg-orange-100'
                                      }`}
                                      >
                                        {module.icon}
                                      </div>
                                      <span className="text-[13px] font-bold tracking-tight leading-tight">
                                        {module.label}
                                      </span>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
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
            <div
              className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200 animate-bounce"
              title="Sincronización pendiente"
            >
              <RefreshCw size={18} className="animate-spin" />
            </div>
          )}

          {/* Campana de notificaciones (Centro de Notificaciones) */}
          <NotificationBell />

          {/* User Profile Dropdown — abre por HOVER (desktop) o TAP (táctil) */}
          <div className="relative group">
            <button
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-black text-xs">
                {user?.nombre?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col items-start leading-none mr-1">
                <span className="text-xs font-black text-slate-900">
                  {user?.nombre?.split(' ')[0]}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {user?.rol}
                </span>
              </div>
              <ChevronDown
                size={14}
                className="text-slate-400 group-hover:text-slate-900 transition-colors"
              />
            </button>

            {/* User Dropdown Content */}
            <div
              className={`absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 transition-all duration-200 transform z-50
              ${userMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0'}`}
            >
              <div className="px-4 py-3 border-b border-slate-50 mb-1">
                <p className="text-sm font-black text-slate-900 truncate">{user?.nombre}</p>
                <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">
                  {user?.email}
                </p>
              </div>
              <Link
                to="/seguridad"
                onClick={() => setUserMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-sm font-black mb-1"
              >
                <Lock size={18} /> Seguridad (2FA)
              </Link>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  handleLogout();
                }}
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
                      const isActive = item.path
                        ? location.pathname.startsWith(item.path)
                        : item.modules && item.modules.some((m) => esRutaActiva(m.path));

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
                        <div
                          key={item.id}
                          className={`rounded-2xl transition-all ${isExpanded ? 'bg-slate-50/80 p-1' : ''}`}
                        >
                          <button
                            onClick={() => toggleDropdown(item.id)}
                            className={`w-full flex items-center justify-between px-4 py-3.5 font-bold transition-all rounded-xl
                              ${isExpanded ? 'text-orange-600' : 'text-slate-600 hover:bg-slate-50'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`${isExpanded ? 'text-orange-500' : 'text-slate-400'}`}
                              >
                                {item.icon}
                              </div>
                              <span className="text-sm">{item.label}</span>
                            </div>
                            <ChevronDown
                              size={16}
                              className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>

                          {isExpanded && (
                            <div className="mt-1 space-y-1 px-1 pb-1 animate-in fade-in slide-in-from-top-2 duration-300">
                              {item.modules
                                .filter((m) => canAccessRoute(m.path, item.id))
                                .map((module) => (
                                  <Link
                                    key={module.path}
                                    to={module.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all
                                    ${
                                      esRutaActiva(module.path)
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                        : 'text-slate-500 hover:text-orange-600 hover:bg-white'
                                    }`}
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
          {/* Bloque de usuario (móvil): Seguridad + Cerrar sesión — antes no había
              forma de salir ni activar 2FA en táctil (el menú de perfil es hover). */}
          <div className="shrink-0 border-t border-slate-100 px-3 py-3 bg-white space-y-1">
            <div className="px-2 pb-1">
              <p className="text-sm font-black text-slate-900 truncate">{user?.nombre}</p>
              <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">
                {user?.rol}
              </p>
            </div>
            <Link
              to="/seguridad"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-sm font-black"
            >
              <Lock size={18} /> Seguridad (2FA)
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all text-sm font-black"
            >
              <LogOut size={18} /> Cerrar Sesión
            </button>
          </div>
          {/* Versión instalada (visible en el menú móvil) — toca para ver las Novedades */}
          <div className="shrink-0 border-t border-slate-100 px-4 py-3 text-center bg-white">
            <button
              onClick={mostrarNovedades}
              className="text-[10px] font-black text-slate-400 hover:text-orange-500 uppercase tracking-widest font-mono inline-flex items-center gap-1"
            >
              <Sparkles size={11} /> CCO WMS · v{APP_VERSION} · Novedades
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
