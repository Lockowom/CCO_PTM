import React from 'react';
import { Download } from 'lucide-react';
import { format } from 'date-fns';

const ExportButton = ({ data, filename = 'export', className = '' }) => {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    // Obtener todas las claves únicas
    const keys = Array.from(new Set(data.flatMap(item => Object.keys(item))));

    // Crear el encabezado del CSV
    const csvContent = [
      keys.join(','),
      ...data.map(item => 
        keys.map(key => {
          let val = item[key];
          if (val === null || val === undefined) val = '';
          if (typeof val === 'object') val = JSON.stringify(val);
          // Escapar comillas dobles y envolver en comillas
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    // Crear el Blob y descargar
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const dateStr = format(new Date(), 'yyyyMMdd_HHmmss');
    link.setAttribute('download', `${filename}_${dateStr}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className={`flex items-center gap-2 px-3 py-2 bg-slate-800 text-white hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors shadow-sm ${className}`}
      title="Exportar a CSV"
    >
      <Download size={16} />
      <span>Exportar CSV</span>
    </button>
  );
};

export default ExportButton;
