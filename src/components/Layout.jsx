import React, { useLayoutEffect, useRef } from 'react';
import Navbar from './Navbar';
import ErrorReportWidget from './ErrorReportWidget';
import gsap from 'gsap';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const mainRef = useRef(null);

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
    </div>
  );
};

export default Layout;
