import React from 'react';

/**
 * Skeleton Loader para Tarjetas/Cards
 * Ideal para módulos móviles como Picking o ubicaciones
 * 
 * @param {number} count - Cantidad de tarjetas a renderizar
 */
export const SkeletonCard = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={`card-${i}`} 
          className="w-full bg-wms-panel/50 backdrop-blur-xl border border-wms-border rounded-xl p-5 shadow-lg animate-pulse"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="h-6 w-1/3 bg-slate-700/50 rounded-md"></div>
            <div className="h-6 w-16 bg-slate-700/50 rounded-full"></div>
          </div>
          
          <div className="space-y-3">
            <div className="h-4 w-full bg-slate-700/30 rounded"></div>
            <div className="h-4 w-5/6 bg-slate-700/30 rounded"></div>
            <div className="h-4 w-4/6 bg-slate-700/30 rounded"></div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <div className="h-10 w-28 bg-slate-700/50 rounded-lg"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default SkeletonCard;