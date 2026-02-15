import React from 'react';
import { Construction } from 'lucide-react';

const Placeholder = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="bg-slate-100 p-6 rounded-full mb-4">
        <Construction size={48} className="text-slate-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-700 mb-2">{title}</h2>
      <p className="text-slate-500 max-w-md">
        Este módulo está en construcción. Pronto podrás acceder a todas las funcionalidades de {title} aquí.
      </p>
    </div>
  );
};

export default Placeholder;