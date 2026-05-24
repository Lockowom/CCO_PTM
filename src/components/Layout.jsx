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
      .subscribe((status, err) => {
        if (err) console.error('Realtime subscription error:', err);
      });

    return () => {
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
        <main className="flex-1 overflow-y-auto custom-scrollbar relative pt-[100px]">
          <div ref={mainRef} className="max-w-[1600px] mx-auto w-full min-h-full p-6 lg:p-10 pb-24">
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