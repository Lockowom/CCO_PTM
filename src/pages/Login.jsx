import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Loader2, ShieldCheck, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (email === 'admin' && password === 'admin') {
        navigate('/dashboard');
      } else {
        setError('Credenciales inválidas');
        setLoading(false);
      }
    }, 1500);
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
          <div className="mb-4 text-center text-red-500 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="text-slate-400" size={18} />
            </div>
            <input 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-white transition-all text-sm text-slate-700 font-medium placeholder:text-slate-400"
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
              className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-white transition-all text-sm text-slate-700 font-medium placeholder:text-slate-400"
              placeholder="Contraseña de acceso"
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#EA580C] hover:bg-orange-700 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <LogIn size={18} />
                Ingresar al Sistema
              </>
            )}
          </button>
        </form>

        {/* Footer Seguro */}
        <div className="mt-8 bg-emerald-50 rounded-xl p-3 flex items-center gap-3 border border-emerald-100">
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