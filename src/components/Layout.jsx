import React, { useLayoutEffect, useRef, useEffect } from 'react';
import Navbar from './Navbar';
import ErrorReportWidget from './ErrorReportWidget';
import gsap from 'gsap';
import { useLocation } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { supabase } from '../supabase';

const Layout = ({ children }) => {
  const location = useLocation();
  const mainRef = useRef(null);

  // Sistema de Notificaciones en Tiempo Real
  useEffect(() => {
    // 1. Configurar canal de escucha global
    const channel = supabase
      .channel('global-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tms_nv_diarias' },
        (payload) => {
          toast.info('Nueva N.V. Cargada', {
            description: `Se ha cargado la N.V. #${payload.new.nv} de ${payload.new.cliente}`,
            duration: 5000,
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tms_partidas' },
        (payload) => {
          toast.success('Nuevas Partidas', {
            description: `Se ha registrado una nueva partida: ${payload.new.partida}`,
            duration: 4000,
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tms_series' },
        (payload) => {
          toast.success('Nuevas Series', {
            description: `Serie cargada: ${payload.new.serie}`,
            duration: 4000,
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tms_farmapack' },
        (payload) => {
          toast.success('Farmapack Actualizado', {
            description: `Nuevo lote registrado: ${payload.new.lote}`,
            duration: 4000,
          });
        }
      )
      // 2. Escuchar cambios de estado automáticos
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tms_nv_diarias' },
        (payload) => {
          // Solo notificar si cambió el estado
          if (payload.new.estado !== payload.old.estado) {
            toast.info('Cambio de Estado', {
              description: `La N.V. #${payload.new.nv} cambió a ${payload.new.estado}`,
              duration: 4000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Animate page transitions when route changes
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Fade out previous content (handled by React rendering), Fade IN new content
      gsap.fromTo(mainRef.current, 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }, mainRef);

    return () => ctx.revert();
  }, [location.pathname]); // Re-run on route change

  return (
    <div className="min-h-screen bg-slate-50 font-poppins flex flex-col overflow-hidden">
      {/* Top Navbar - El único menú */}
      <Navbar />

      {/* Main Content */}
      <main ref={mainRef} className="flex-1 w-full px-4 py-6 lg:px-8 overflow-y-auto relative z-0">
        <div className="max-w-[1920px] mx-auto w-full h-full pb-20">
          {children}
        </div>
      </main>

      {/* Widget de Errores */}
      <ErrorReportWidget />

      {/* Toaster de Notificaciones (Sonner) */}
      <Toaster position="top-right" richColors expand={true} />
    </div>
  );
};

export default Layout;
