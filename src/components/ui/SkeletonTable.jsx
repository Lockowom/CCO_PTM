import React from 'react';

/**
 * Skeleton Loader para Tablas (Diseño Glassmorphism)
 * 
 * @param {number} rows - Cantidad de filas a simular
 * @param {number} columns - Cantidad de columnas a simular
 */
export const SkeletonTable = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="w-full bg-wms-panel/80 backdrop-blur-xl border border-wms-border rounded-2xl overflow-hidden shadow-2xl">
      <div className="animate-pulse">
        {/* Cabecera de la tabla */}
        <div className="h-14 bg-slate-800/80 border-b border-wms-border flex items-center px-6 gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={`head-${j}`} className="h-4 bg-slate-700/50 rounded flex-1"></div>
          ))}
        </div>
        
        {/* Filas de la tabla */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={`row-${i}`} className="flex items-center border-b border-slate-800/50 px-6 py-4 gap-4">
            {Array.from({ length: columns }).map((_, j) => (
              <div 
                key={`col-${i}-${j}`} 
                className={`h-4 bg-slate-700/30 rounded flex-1 ${j === 0 ? 'max-w-[80px]' : ''}`}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonTable;