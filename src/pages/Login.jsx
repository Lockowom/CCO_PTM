import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, Loader2, ShieldCheck, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { login, loading, error, isAuthenticated } = useAuth();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white font-poppins p-4">
      <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-2xl w-full max-w-sm border-2 border-orange-100 relative">

        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg border border-slate-100 overflow-hidden p-2">
            <img 
              src="https://i.imgur.com/YJh67CY.png" 
              alt="Logo CCO" 
              className="w-full h-full object-contain"
            />
          </div>

          <div className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest mb-3 border border-orange-100">
            ACCESO AUTORIZADO
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-orange-600 tracking-tight mb-1">Control de Bodega</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-center text-red-700 text-sm font-bold animate-pulse">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="text-orange-500" size={18} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all text-sm text-slate-700 font-medium placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-300"
              placeholder="Correo corporativo"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="text-orange-500" size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full pl-11 pr-12 py-3 sm:py-3.5 bg-slate-50 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all text-sm text-slate-700 font-medium placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-300"
              placeholder="Contraseña de acceso"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-orange-500 transition-colors disabled:cursor-not-allowed"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-400 disabled:to-orange-400 text-white py-3 sm:py-3.5 rounded-lg font-bold text-sm shadow-lg shadow-orange-500/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-6 disabled:cursor-not-allowed active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <LogIn size={18} />
                <span>Ingresar al Sistema</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Security */}
        <div className="mt-6 bg-emerald-50 rounded-lg p-4 flex items-center gap-3 border-2 border-emerald-200 shadow-sm">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2.5 rounded-lg text-white flex-shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-900">✓ Conexión Segura</p>
            <p className="text-[10px] text-emerald-700 font-medium">SSL 256-bit • © 2026 CCO</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;