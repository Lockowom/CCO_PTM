import React, { useState, useEffect, useRef } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Versión real de la app (inyectada por Vite desde package.json). Se muestra en el
// login para que cualquier PDA sepa qué build corre sin abrir el menú.
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  const [loadingPhase, setLoadingPhase] = useState(0); // 0: IDLE, 1: AUTH, 2: SYNC, 3: REDIRECT

  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);

  const { login, isAuthenticated } = useAuth();

  // Si el guard nos mandó aquí desde un deep-link (p.ej. el QR de un bloque de
  // conteo), volver a esa URL tras autenticarse en vez de a la landing del rol.
  const from = location.state?.from
    ? `${location.state.from.pathname || ''}${location.state.from.search || ''}` || '/'
    : '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);
    setLoadingPhase(1); // Fase: Autenticación

    try {
      const success = await login(email, password);

      if (success) {
        setLoadingPhase(2); // Fase: Sincronización de Núcleo

        await new Promise(r => setTimeout(r, 1200));
        setLoadingPhase(3); // Fase: Estableciendo Conexión

        await new Promise(r => setTimeout(r, 600));
        navigate(from, { replace: true });
      } else {
        setLoadingPhase(0);
        setError("Acceso denegado. Verifica tus credenciales.");
      }
    } catch (err) {
      setLoadingPhase(0);
      setError("Error de conexión con el servidor.");
    } finally {
      if (!isAuthenticated) setLoading(false);
    }
  };

  const getLoadingMessage = () => {
    switch (loadingPhase) {
      case 1: return "Validando identidad…";
      case 2: return "Sincronizando módulos…";
      case 3: return "Conexión establecida. Redirigiendo…";
      default: return "Cargando…";
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-dvh w-full flex items-center justify-center bg-slate-50 font-sans selection:bg-orange-500 selection:text-white relative overflow-hidden px-5"
    >
      {/* Fondo claro con acentos naranja muy sutiles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[28rem] h-[28rem] bg-orange-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-48 -left-40 w-[30rem] h-[30rem] bg-amber-100/60 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(249,115,22,0.06),transparent_60%)]" />
      </div>

      {/* Tarjeta */}
      <div className="login-container w-full max-w-[400px] relative z-10">
        <div className="relative bg-white/90 backdrop-blur-xl border border-slate-200/70 rounded-3xl px-7 py-9 sm:px-9 sm:py-10 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.25)] overflow-hidden">

          {/* Overlay de carga (claro) */}
          {loading && (
            <div className="absolute inset-0 z-50 bg-white/85 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center anim-scale-in">
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full border border-orange-100 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-t-2 border-orange-500 animate-[spin_1.2s_linear_infinite]" />
                  <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center">
                    <ShieldCheck size={30} className="text-orange-500" />
                  </div>
                </div>
              </div>
              <h4 className="text-slate-800 font-black text-sm tracking-tight mb-4">{getLoadingMessage()}</h4>
              <div className="w-52 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-700 ease-out ${loadingPhase >= 1 ? 'w-1/3' : 'w-0'} ${loadingPhase >= 2 ? 'w-2/3' : ''} ${loadingPhase >= 3 ? 'w-full' : ''}`} />
              </div>
            </div>
          )}

          {/* Encabezado */}
          <div className="animate-form-item flex flex-col items-center text-center mb-8">
            <img src="/logo-ptm.png" alt="PTM Health Care" className="h-14 w-auto object-contain mb-5" />
            <div className="flex items-center gap-2.5 mb-1.5">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">CCO</h3>
              <span className="px-2.5 py-1 bg-orange-500 text-white text-[10px] font-black rounded-md tracking-[0.15em] uppercase">System</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 tracking-wide">Warehouse Management System</p>
          </div>

          {error && (
            <div className="animate-form-item mb-6 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2.5 text-red-600 text-xs font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="animate-form-item">
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <User size={18} className={`transition-colors ${focusedInput === 'email' ? 'text-orange-500' : 'text-slate-400'}`} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all text-slate-800 font-semibold text-sm placeholder:text-slate-400"
                  placeholder="Correo o identificador"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="animate-form-item">
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Lock size={18} className={`transition-colors ${focusedInput === 'password' ? 'text-orange-500' : 'text-slate-400'}`} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  disabled={loading}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all text-slate-800 font-semibold text-sm placeholder:text-slate-400"
                  placeholder="Contraseña"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-orange-500 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="animate-form-item pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full group bg-orange-500 hover:bg-orange-600 text-white p-3.5 rounded-xl font-black text-sm tracking-tight shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span className="flex items-center justify-center gap-2.5">
                  {loading ? (
                    <RefreshCw className="animate-spin" size={18} />
                  ) : (
                    <>
                      <span>Iniciar sesión</span>
                      <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>

          {/* Versión de la app: visible para todos al abrir, útil para soporte. */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] font-mono">
              CCO WMS · v{APP_VERSION}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
