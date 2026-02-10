import React, { useState, useEffect } from 'react';
import { Package, Truck, Search, QrCode, ArrowRight } from 'lucide-react';

const API_URL = 'https://cco-ptm.onrender.com/api';

const Packing = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Packing</h2>
          <p className="text-slate-500 text-sm">Embalaje y etiquetado</p>
        </div>
      </div>
      
      <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
            <Package size={32} className="text-orange-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700">Módulo en construcción</h3>
        <p className="text-slate-500 max-w-md mt-2">
            Aquí podrás escanear productos pickeados y generar las etiquetas de despacho.
        </p>
      </div>
    </div>
  );
};

export default Packing;
