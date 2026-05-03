import { toast } from 'sonner';

export const wmsToast = {
  pickingSuccess: (sku, qty, racha) => {
    toast.success(`¡Objetivo asegurado! 📦`, {
      description: `${qty} uds de ${sku} extraídas.`,
      duration: 3000,
      icon: racha > 5 ? '🔥' : '✅',
      style: {
        background: '#1e293b',
        border: '1px solid #10b981',
        color: '#f8fafc',
      },
    });
  },
  stockWarning: (location) => {
    toast.warning(`⚠️ Discrepancia en ${location}`, {
      description: 'El sistema esperaba más unidades. Solicitando reconteo...',
      style: { 
        background: '#1e293b', 
        border: '1px solid #f97316', 
        color: '#f8fafc'  
      },
    });
  },
  systemOffline: () => {
    toast.error(`📡 Señal Perdida`, {
      description: 'Cambiando a modo offline local con Dexie.js. Sincronización en pausa.',
      style: { 
        background: '#1e293b', 
        border: '1px solid #ef4444', 
        color: '#f8fafc'  
      },
    });
  },
  systemOnline: () => {
    toast.success(`⚡ Conexión Restablecida`, {
      description: 'Sincronizando cola de operaciones locales con el servidor...',
      style: { 
        background: '#1e293b', 
        border: '1px solid #10b981', 
        color: '#f8fafc'  
      },
    });
  }
};