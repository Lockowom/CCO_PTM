import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

const AnimatedPage = ({ children, className = '' }) => {
  const comp = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Animate main container fade in and slide up
      gsap.from(comp.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power3.out"
      });

      // Stagger children elements if they have 'animate-item' class
      gsap.from(".animate-item", {
        opacity: 0,
        y: 20,
        duration: 0.4,
        stagger: 0.1,
        delay: 0.2,
        ease: "power2.out"
      });
      
    }, comp);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={comp} className={`w-full ${className}`}>
      {children}
    </div>
  );
};

export default AnimatedPage;