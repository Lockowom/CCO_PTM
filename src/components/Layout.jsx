import React, { useRef, useEffect } from 'react';
import Navbar from './Navbar';
import ErrorReportWidget from './ErrorReportWidget';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../supabase';

const Layout = ({ children }) => {
  const location = useLocation();
  const mainRef = useRef(null);

  // Sistema de Notificaciones en Tiempo Real (con throttle para uploads masivos)
  useEffect(() => {
    // Acumuladores para batch — en vez de 1 toast por fila, agrupa en 1 toast
    const insertCounters = { tms_nv_diarias: 0, tms_partidas: 0, tms_series: 0, tms_farmapack: 0 };
    let flushTimer = null;

    const flushNotifications = () => {
      if (insertCounters.tms_nv_diarias > 0) {
        const n = insertCounters.tms_nv_diarias;
        toast.info(n === 1 ? 'Nueva N.V. Cargada' : `${n} N.V. Cargadas`, {
          id: 'batch-nv', duration: 5000,
        });
      }
      if (insertCounters.tms_partidas > 0) {
        const n = insertCounters.tms_partidas;
        toast.success(n === 1 ? 'Nueva Partida' : `${n} Partidas cargadas`, {
          id: 'batch-partidas', duration: 4000,
        });
      }
      if (insertCounters.tms_series > 0) {
        const n = insertCounters.tms_series;
        toast.success(n === 1 ? 'Nueva Serie' : `${n} Series cargadas`, {
          id: 'batch-series', duration: 4000,
        });
      }
      if (insertCounters.tms_farmapack > 0) {
        const n = insertCounters.tms_farmapack;
        toast.success(n === 1 ? 'Farmapack Actualizado' : `${n} lotes Farmapack cargados`, {
          id: 'batch-farmapack', duration: 4000,
        });
      }
      // Reset
      Object.keys(insertCounters).forEach(k => insertCounters[k] = 0);
    };

    const scheduleFlush = () => {
      if (flushTimer) clearTimeout(flushTimer);
      flushTimer = setTimeout(flushNotifications, 2000); // Agrupar en ventana de 2s
    };

    const channel = supabase
      .channel('global-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tms_nv_diarias' },
        () => { insertCounters.tms_nv_diarias++; scheduleFlush(); }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tms_partidas' },
        () => { insertCounters.tms_partidas++; scheduleFlush(); }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tms_series' },
        () => { insertCounters.tms_series++; scheduleFlush(); }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tms_farmapack' },
        () => { insertCounters.tms_farmapack++; scheduleFlush(); }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tms_nv_diarias' },
        (payload) => {
          if (payload.new.estado !== payload.old.estado) {
            toast.info('Cambio de Estado', {
              description: `N.V. #${payload.new.nv} → ${payload.new.estado}`,
              id: `estado-${payload.new.nv}`,
              duration: 4000,
            });
          }
        }
      )
      .subscribe((status, err) => {
        if (err) console.error('Realtime subscription error:', err);
      });

    return () => {
      if (flushTimer) clearTimeout(flushTimer);
      supabase.removeChannel(channel);
    };
  }, []);

  // Animaciones Enterprise para transiciones de página
  useGSAP(() => {
    // Animación de entrada de página
    gsap.fromTo(mainRef.current, 
      { opacity: 0, y: 20, filter: "blur(10px)", scale: 0.98 }, 
      { opacity: 1, y: 0, filter: "blur(0px)", scale: 1, duration: 0.8, ease: "expo.out", clearProps: 'all' }
    );

    // Animación de los orbes del fondo
    gsap.to(".layout-orb", {
      x: "random(-100, 100)",
      y: "random(-50, 50)",
      duration: "random(15, 25)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 2
    });
  }, [location.pathname]); 

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden relative selection:bg-orange-200 selection:text-orange-900">
      
      {/* Background Decorator - Simplificado para Legibilidad */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="layout-orb absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-slate-200/20 blur-[120px] rounded-full"></div>
        <div className="layout-orb absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-100/30 blur-[120px] rounded-full"></div>
      </div>

      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main App Shell Container */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative pt-[72px] sm:pt-[100px]">
          <div ref={mainRef} className="max-w-[1600px] mx-auto w-full min-h-full p-3 sm:p-6 lg:p-10 pb-24">
            {children}
          </div>
        </main>

        {/* Widget de Errores */}
        <ErrorReportWidget />
      </div>
    </div>
  );
};

export default Layout;