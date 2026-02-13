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
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-100 relative">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-md border border-slate-100 p-2">
            {/* Placeholder para logo PTM Health */}
            <div className="text-center">
              <span className="text-orange-500 font-bold text-xl">PTM</span>
              <span className="text-slate-600 text-xs block">Health</span>
            </div>
          </div>
          
          <div className="bg-orange-50 text-orange-600 px-4 py-1 rounded-full text-xs font-bold tracking-wider mb-3 border border-orange-100">
            ACCESO AUTORIZADO
          </div>
          
          <h1 className="text-2xl font-bold text-orange-600">Control de Bodega</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="text-slate-400" size={18} />
            </div>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-white transition-all text-sm text-slate-700 font-medium placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Correo corporativo"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="text-slate-400" size={18} />
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-white transition-all text-sm text-slate-700 font-medium placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Contraseña de acceso"
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#EA580C] hover:bg-orange-700 disabled:bg-orange-400 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2 mt-2 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <LogIn size={18} />
                Ingresar al Sistema
              </>
            )}
          </button>
        </form>

        {/* Demo Users Info */}
        <div className="mt-8 bg-blue-50 rounded-xl p-3 border border-blue-200">
          <p className="text-xs font-bold text-blue-800 mb-2">📝 Usuarios de Prueba:</p>
          <div className="space-y-1 text-[10px] text-blue-700 font-mono">
            <p>Email: admin@cco.cl | Pass: 123456</p>
            <p>Email: operador@cco.cl | Pass: 123456</p>
          </div>
        </div>

        {/* Footer Seguro */}
        <div className="mt-4 bg-emerald-50 rounded-xl p-3 flex items-center gap-3 border border-emerald-100">
          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-800">Conexión Encriptada</p>
            <p className="text-[10px] text-emerald-600">SSL 256-bit • © 2026 CCO</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;