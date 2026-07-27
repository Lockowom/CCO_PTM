import { AlertOctagon, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px]"></div>

      <div className="z-10 text-center max-w-lg">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <AlertOctagon className="w-32 h-32 text-orange-500/80 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-black text-slate-900">404</span>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-wide">
          Destino Desconocido
        </h1>

        <p className="text-slate-500 mb-8 text-lg">
          La ruta logística que intentas consultar no existe en la base de datos del sistema, o fue
          reasignada.
        </p>

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-slate-900 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] hover:-translate-y-1"
        >
          <Home className="w-5 h-5" />
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default NotFound;
