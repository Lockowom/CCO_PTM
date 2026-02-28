import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { User, Lock, Eye, EyeOff, Loader2, ShieldCheck, LogIn, Warehouse, Truck, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const { login, isAuthenticated } = useAuth();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Animación de Fondo Sutil
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Entrada del formulario
      gsap.from(".login-card", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.2
      });

      // 2. Elementos flotantes de fondo (animación continua sutil)
      gsap.to(".floating-icon", {
        y: "random(-20, 20)",
        x: "random(-20, 20)",
        rotation: "random(-15, 15)",
        duration: "random(3, 6)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.5
      });

      // 3. Gradiente sutil animado (simulado con opacidad)
      gsap.to(".bg-gradient-overlay", {
        opacity: 0.6,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    try {
      const success = await login(email, password);
      if (success) {
        // Animación de salida exitosa
        gsap.to(".login-card", {
          scale: 0.95,
          opacity: 0,
          duration: 0.5,
          onComplete: () => navigate('/', { replace: true })
        });
      } else {
        setError("Credenciales inválidas");
        // Shake animation for error
        gsap.to(".login-card", { x: [-5, 5, -5, 5, 0], duration: 0.4 });
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden font-poppins">
      
      {/* --- Fondo Animado Sutil --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Círculos decorativos muy sutiles */}
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-orange-100/40 blur-3xl floating-icon"></div>
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] rounded-full bg-blue-50/50 blur-2xl floating-icon"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] rounded-full bg-slate-100/60 blur-3xl floating-icon"></div>
        
        {/* Iconos flotantes muy tenues */}
        <Warehouse className="absolute top-[15%] left-[15%] text-slate-200/50 w-24 h-24 floating-icon" />
        <Truck className="absolute bottom-[20%] right-[15%] text-slate-200/50 w-32 h-32 floating-icon" />
        <Box className="absolute top-[40%] right-[30%] text-slate-200/30 w-16 h-16 floating-icon" />
      </div>

      {/* --- Tarjeta de Login --- */}
      <div className="login-card bg-white p-8 sm:p-10 rounded-3xl shadow-2xl shadow-slate-200/50 w-full max-w-sm border border-slate-100 relative z-10 mx-4">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-100 border border-slate-50 p-4 transform hover:scale-105 transition-transform duration-500">
            <img 
              src="https://i.imgur.com/YJh67CY.png" 
              alt="Logo CCO" 
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>

          <div className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-3 border border-orange-100/50">
            Acceso Corporativo
          </div>

          <h1 className="text-2xl font-black text-slate-800 tracking-tight text-center">
            Bienvenido a <span className="text-orange-500">CCO</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Ingresa tus credenciales para continuar</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-xs font-bold animate-pulse">
            <div className="bg-red-100 p-1.5 rounded-full">
              <ShieldCheck size={14} />
            </div>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="group">
            <label className="block text-xs font-bold text-slate-400 mb-1.5 ml-1 uppercase tracking-wide">Correo Electrónico</label>
            <div className="relative transition-all duration-300 focus-within:transform focus-within:scale-[1.02]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 focus:bg-white transition-all text-sm text-slate-700 font-medium placeholder:text-slate-300"
                placeholder="usuario@empresa.com"
                required
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-xs font-bold text-slate-400 mb-1.5 ml-1 uppercase tracking-wide">Contraseña</label>
            <div className="relative transition-all duration-300 focus-within:transform focus-within:scale-[1.02]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 focus:bg-white transition-all text-sm text-slate-700 font-medium placeholder:text-slate-300"
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-orange-500 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <span>Iniciar Sesión</span>
                <LogIn size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <p className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-2">
            <ShieldCheck size={12} className="text-emerald-500" />
            Plataforma Segura SSL 256-bit
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
