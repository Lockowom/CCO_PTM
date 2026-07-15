import React from 'react';
import { PlusCircle, Info, Tv, Blocks, ShieldCheck, Settings } from 'lucide-react';

// Placeholders de las pantallas del Panel (Fase de estructura). Cada una describe
// lo que portará su fase. Se irán reemplazando por el port nativo real.
function Scaffold({ icon: Icon, titulo, resumen, puntos }) {
  return (
    <div className="anim-fade-up bg-white rounded-xl shadow-sm p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
          <Icon size={22} />
        </div>
        <div>
          <h2 className="text-lg font-black text-gray-800">{titulo}</h2>
          <p className="text-xs text-gray-400">{resumen}</p>
        </div>
      </div>
      <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-bold text-amber-700 inline-block">
        Estructura lista · pendiente port de detalle (datos de ejemplo)
      </div>
      <ul className="mt-4 space-y-1.5 text-sm text-gray-600">
        {puntos.map((p) => (
          <li key={p} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />{p}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PanelIngresar() {
  return <Scaffold icon={PlusCircle} titulo="Ingresar Nota de Venta" resumen="Formulario de alta de N.V. (port de /ingresar)"
    puntos={['Formulario N.V. multi-paso con validación', 'Consolidados y catálogo maestro', 'Envío vía proxy (Google Apps Script)', 'Login de operador y auditoría']} />;
}
export function PanelInfo() {
  return <Scaffold icon={Info} titulo="Información de N.V." resumen="Búsqueda y detalle de notas de venta (port de /info)"
    puntos={['Buscador de N.V.', 'Detalle completo con trazabilidad', 'Estados e incidencias', 'Alertas de riesgo']} />;
}
export function PanelTV() {
  return <Scaffold icon={Tv} titulo="Modo TV" resumen="Vista de indicadores para pantalla grande (port de /tv)"
    puntos={['KPIs a pantalla completa', 'Auto-rotación de secciones', 'Actualización en tiempo real', 'Diseño de alto contraste']} />;
}
export function PanelBuilder() {
  return <Scaffold icon={Blocks} titulo="Builder de Dashboard" resumen="Constructor de widgets drag-drop (port de /builder)"
    puntos={['Catálogo de widgets + grid arrastrable', 'Motor de fórmulas y campos calculados', 'Panel de configuración por widget', 'Guardar/gestionar layouts']} />;
}
export function PanelAuditoria() {
  return <Scaffold icon={ShieldCheck} titulo="Auditoría" resumen="Registro de cambios y actividad (port de /auditoria)"
    puntos={['Bitácora de creaciones/ediciones', 'KPIs por operador', 'Detección de conflictos', 'Filtros por fecha y usuario']} />;
}
export function PanelConfig() {
  return <Scaffold icon={Settings} titulo="Configuración" resumen="Catálogos y ajustes del Panel (port de /configuracion)"
    puntos={['Catálogo maestro editable', 'Parámetros del dashboard', 'Gestión de estados', 'Roles y accesos']} />;
}
