import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Shared timer hook for Picking and Packing processes.
 * Tracks active time, idle time (pauses + tab-hidden periods).
 *
 * @param {Object} options
 * @param {number} options.initialTiempo - Initial elapsed time in seconds (for session restore)
 * @param {number} options.initialOcio - Initial idle time in seconds (for session restore)
 * @param {function} options.onTimeUpdate - Callback when time changes (for Zustand persist)
 * @returns {Object} Timer state and controls
 */
export const useProcessTimer = ({ initialTiempo = 0, initialOcio = 0, onTimeUpdate } = {}) => {
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(initialTiempo);
  const [enPausa, setEnPausa] = useState(false);
  const [tiempoOcio, setTiempoOcio] = useState(initialOcio);
  const [pausaInicio, setPausaInicio] = useState(null);

  const ocioRef = useRef(null);
  const lastHiddenTime = useRef(null);

  // Sync with external store (debounced)
  const lastSyncRef = useRef(0);
  useEffect(() => {
    if (onTimeUpdate) {
      const now = Date.now();
      // Debounce: only sync every 5 seconds
      if (now - lastSyncRef.current >= 5000) {
        onTimeUpdate(tiempoTranscurrido, tiempoOcio);
        lastSyncRef.current = now;
      }
    }
  }, [tiempoTranscurrido, tiempoOcio, onTimeUpdate]);

  // Main timer + visibility tracking
  useEffect(() => {
    let intervalId = null;

    const handleVisibilityChange = () => {
      if (document.hidden && !enPausa && tiempoInicio) {
        lastHiddenTime.current = Date.now();
      } else if (!document.hidden && lastHiddenTime.current && !enPausa) {
        const now = Date.now();
        const diffSeconds = Math.floor((now - lastHiddenTime.current) / 1000);
        if (diffSeconds > 0) {
          setTiempoOcio(prev => prev + diffSeconds);
          toast.info(`Regresaste: ${diffSeconds}s agregados a tiempo inactivo`);
        }
        lastHiddenTime.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (tiempoInicio && !enPausa) {
      intervalId = setInterval(() => {
        const now = Date.now();
        let currentHidden = 0;
        if (document.hidden && lastHiddenTime.current) {
          currentHidden = Math.floor((now - lastHiddenTime.current) / 1000);
        }
        const diffSeconds = Math.floor((now - tiempoInicio) / 1000) - (tiempoOcio + currentHidden);
        setTiempoTranscurrido(diffSeconds > 0 ? diffSeconds : 0);
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [tiempoInicio, enPausa, tiempoOcio]);

  // Pause idle counter
  useEffect(() => {
    if (enPausa && pausaInicio) {
      ocioRef.current = setInterval(() => {
        setTiempoOcio(prev => prev + 1);
      }, 1000);
    } else {
      if (ocioRef.current) clearInterval(ocioRef.current);
    }
    return () => { if (ocioRef.current) clearInterval(ocioRef.current); };
  }, [enPausa, pausaInicio]);

  const start = (restoredSeconds = 0) => {
    setTiempoInicio(Date.now() - (restoredSeconds * 1000));
    setTiempoTranscurrido(restoredSeconds);
    setTiempoOcio(0);
    setEnPausa(false);
  };

  const togglePausa = () => {
    if (!enPausa) {
      setPausaInicio(Date.now());
      toast.warning('Proceso Pausado');
    } else {
      setPausaInicio(null);
      toast.success('Proceso Reanudado');
    }
    setEnPausa(prev => !prev);
  };

  const reset = () => {
    setTiempoInicio(null);
    setTiempoTranscurrido(0);
    setTiempoOcio(0);
    setEnPausa(false);
    setPausaInicio(null);
  };

  const formatTime = (seconds) => {
    const s = seconds || 0;
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    tiempoInicio,
    tiempoTranscurrido,
    tiempoOcio,
    enPausa,
    start,
    togglePausa,
    reset,
    formatTime,
  };
};
