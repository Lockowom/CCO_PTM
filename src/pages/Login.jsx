import React, { useState, useEffect, useRef } from 'react';
import { User, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Cpu, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginSchema } from '../lib/validation/schemas';
import { validateForm } from '../lib/validation/validateForm';
import { LIMITS } from '../lib/validation/limits';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  const [loadingPhase, setLoadingPhase] = useState(0); // 0: IDLE, 1: AUTH, 2: SYNC, 3: REDIRECT
  
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);


  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    // Validación de formato (límites de entrada) antes de tocar el backend.
    const { ok, errors } = validateForm(loginSchema, { email, password }, { silent: true });
    if (!ok) {
      setError(errors.email || errors.password || 'Datos inválidos');
      return;
    }

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
        navigate('/', { replace: true });
      } else {
        setLoadingPhase(0);
        setError("Acceso denegado. Verifica tus credenciales.");
      }
    } catch (err) {
      setLoadingPhase(0);
      setError("Error de conexión con el núcleo.");
    } finally {
      if (!isAuthenticated) setLoading(false);
    }
  };

  const getLoadingMessage = () => {
    switch(loadingPhase) {
      case 1: return "Validando identidad...";
      case 2: return "Sincronizando módulos de núcleo...";
      case 3: return "Conexión establecida. Redirigiendo...";
      default: return "Cargando...";
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen w-full flex items-center justify-center bg-[#020617] font-sans selection:bg-orange-500 selection:text-white relative overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-orange-500/5 to-transparent rounded-full animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-indigo-500/5 to-transparent rounded-full animate-pulse" style={{ animationDuration: '6s' }}></div>
      </div>

      {/* --- CENTERED LOGIN BOX --- */}
      <div className="login-container w-full max-w-[460px] px-6 relative z-10 group">
        
        {/* Background Aura */}
        <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/10 to-amber-600/10 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
        
        <div className="relative bg-[#0a0f1e]/40 backdrop-blur-[40px] border border-white/10 rounded-[3rem] p-10 md:p-14 shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden">
          
          {/* Neural Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 z-50 bg-[#020617]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
              <div className="relative mb-10">
                <div className="w-32 h-32 rounded-full border border-orange-500/10 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-t-2 border-orange-500 animate-[spin_1.5s_linear_infinite]" />
                  <div className="absolute inset-2 rounded-full border-b-2 border-amber-500/50 animate-[spin_2s_linear_infinite_reverse]" />
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-600/20 flex items-center justify-center">
                    <ShieldCheck size={40} className="text-orange-500 animate-pulse" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-white font-black text-sm uppercase tracking-[0.4em] animate-pulse">
                    {getLoadingMessage()}
                  </h4>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Protocolo de Seguridad Nivel 4</p>
                </div>
                
                {/* Progress bar animada Premium */}
                <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden mx-auto border border-white/5">
                  <div className={`h-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(249,115,22,0.5)] ${loadingPhase >= 1 ? 'w-1/3' : ''} ${loadingPhase >= 2 ? 'w-2/3' : ''} ${loadingPhase >= 3 ? 'w-full' : ''}`} />
                </div>

                <div className="flex items-center justify-center gap-3 opacity-30">
                  <Cpu size={14} className="text-orange-500" />
                  <div className="flex gap-1">
                    {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-orange-500 animate-bounce" style={{animationDelay: `${i*0.2}s`}} />)}
                  </div>
                  <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">Quantum Link Established</span>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="animate-form-item flex flex-col items-center text-center mb-12">
            <div className="relative mb-8 group-hover:scale-110 transition-transform duration-500">
              <div className="absolute -inset-4 bg-orange-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl flex items-center justify-center shadow-2xl border border-white/10 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.2)_0%,transparent_70%)]" />
                <img 
                  src="https://i.imgur.com/YJh67CY.png" 
                  alt="Logo" 
                  className="w-12 h-12 object-contain relative z-10" 
                  style={{ filter: 'brightness(0) invert(1) drop-shadow(0 0 12px rgba(249,115,22,0.6))' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://cdn-icons-png.flaticon.com/512/2271/2271062.png";
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-4xl font-black text-white tracking-tighter">CCO</h3>
              <span className="px-3 py-1 bg-orange-500 text-white text-xs font-black rounded-lg tracking-[0.2em] uppercase shadow-lg shadow-orange-500/20">System</span>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] ml-2">Core Access Protocol</p>
          </div>

          {error && (
            <div className="animate-form-item mb-8 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-[10px] font-black uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="animate-form-item">
              <div className="group relative">
                <div className={`absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl blur opacity-0 transition duration-300 ${focusedInput === 'email' ? 'opacity-20' : ''}`} />
                <div className="relative">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <User size={18} className={`transition-colors duration-300 ${focusedInput === 'email' ? 'text-orange-500' : 'text-slate-600'}`} />
                  </div>
                  <input
                    type="email"
                    maxLength={LIMITS.EMAIL}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    disabled={loading}
                    className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/5 rounded-2xl focus:outline-none focus:border-orange-500/30 transition-all text-white font-bold text-sm placeholder:text-slate-700"
                    placeholder="Identificador"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="animate-form-item">
              <div className="group relative">
                <div className={`absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl blur opacity-0 transition duration-300 ${focusedInput === 'password' ? 'opacity-20' : ''}`} />
                <div className="relative">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Lock size={18} className={`transition-colors duration-300 ${focusedInput === 'password' ? 'text-orange-500' : 'text-slate-600'}`} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    maxLength={LIMITS.PASSWORD_MAX}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    disabled={loading}
                    className="w-full pl-14 pr-14 py-5 bg-white/5 border border-white/5 rounded-2xl focus:outline-none focus:border-orange-500/30 transition-all text-white font-bold text-sm placeholder:text-slate-700"
                    placeholder="Contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-5 flex items-center text-slate-600 hover:text-orange-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="animate-form-item pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full relative group bg-white text-slate-950 p-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] hover:shadow-[0_25px_50px_-12px_rgba(251,146,60,0.3)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 overflow-hidden disabled:opacity-50"
              >
                <div className="relative z-10 flex items-center justify-center gap-4">
                  {loading ? (
                    <RefreshCw className="animate-spin" size={20} />
                  ) : (
                    <>
                      <span>Iniciar Sesión</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
                <div className="absolute inset-0 bg-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>
          </form>

        </div>
      </div>

    </div>
  );
};

export default Login;
