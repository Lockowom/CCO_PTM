import React, { useLayoutEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export const AnimatedPage = ({ children, className = '' }) => {
  const container = useRef(null);

  useGSAP(() => {
    // Transición de módulo estilo "Tablet Industrial"
    gsap.from(container.current, {
      y: 30,
      opacity: 0,
      duration: 0.5,
      ease: 'power3.out',
      clearProps: 'all' // Vital para evitar bugs de z-index en Tailwind
    });

    // Animar elementos internos en cascada
    gsap.from(".animate-item", {
      opacity: 0,
      y: 15,
      duration: 0.4,
      stagger: 0.05,
      delay: 0.15,
      ease: "power2.out",
      clearProps: 'all'
    });
  }, { scope: container });

  return (
    <div ref={container} className={`w-full ${className}`}>
      {children}
    </div>
  );
};

export default AnimatedPage;