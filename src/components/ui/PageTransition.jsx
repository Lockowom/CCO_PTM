import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

/**
 * Componente Wrapper para dar animaciones fluidas (Fade y Slide) a las páginas
 * al momento de montarse.
 */
export const PageTransition = ({ children, className = '' }) => {
  const container = useRef(null);

  useGSAP(() => {
    gsap.from(container.current, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out',
      clearProps: 'all' // Vital para evitar bugs de z-index
    });
  }, { scope: container });

  return (
    <div ref={container} className={`w-full min-h-screen ${className}`}>
      {children}
    </div>
  );
};

export default PageTransition;