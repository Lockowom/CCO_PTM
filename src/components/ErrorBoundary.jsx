import React, { Component } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Logger } from '../lib/logger';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    Logger.error(error, {
      kind: 'frontend',
      module: 'ui',
      screen: document.title || 'ErrorBoundary',
      action: 'react_error_boundary',
      message: 'Error capturado por React ErrorBoundary',
      handled: true,
      context: {
        componentStack: errorInfo?.componentStack || '',
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="bg-slate-50 border border-red-500/30 rounded-2xl p-8 max-w-lg w-full shadow-[0_0_30px_rgba(239,68,68,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">Error del Sistema</h1>
            <p className="text-slate-500 text-center mb-6">
              Ha ocurrido un fallo crítico en este módulo. El equipo técnico ha sido notificado.
            </p>
            
            <div className="bg-slate-950 rounded-lg p-4 mb-6 overflow-auto max-h-32 border border-slate-200">
              <p className="text-red-400 font-mono text-sm whitespace-pre-wrap">
                {this.state.error && this.state.error.toString()}
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              {/* Reintentar: recarga el MÓDULO actual (no bota a dashboard) y
                  toma los chunks nuevos tras una actualización de la web. */}
              <button
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-slate-900 py-3 px-4 rounded-xl font-bold transition-colors"
              >
                <RefreshCcw className="w-5 h-5" />
                Reiniciar Módulo
              </button>
              {/* Ir al inicio: '/' pasa por el SmartRedirect → lleva a cada rol a su
                  landing correcto (NO hardcodea /dashboard, que algunos roles no ven). */}
              <button
                onClick={() => { window.location.href = '/'; }}
                className="w-full text-center text-slate-500 hover:text-slate-700 py-2 text-sm font-semibold transition-colors"
              >
                Ir al inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
