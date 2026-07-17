import { useState } from "react";
import {
  DATA_SOURCES, WIDGET_TYPES,
} from "../widget-registry";

function WidgetCatalog({ onAdd, onClose }) {
  const [step, setStep] = useState("type");
  const [selectedType, setSelectedType] = useState(null);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/20 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-[500px] max-w-[95vw] max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">
            {step === "type" ? "Elegir tipo de widget" : "Elegir fuente de datos"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">X</button>
        </div>

        {step === "type" && (
          <div className="p-4 grid grid-cols-2 gap-3">
            {WIDGET_TYPES.map((wt) => (
              <button
                key={wt.type}
                onClick={() => { setSelectedType(wt.type); setStep("source"); }}
                className="text-left p-4 rounded-xl border border-gray-200 hover:border-[#ea580c] hover:bg-orange-50/50 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-mono font-bold text-gray-600 mb-2">
                  {wt.icon}
                </div>
                <div className="text-sm font-semibold text-gray-800">{wt.label}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{wt.description}</div>
              </button>
            ))}
          </div>
        )}

        {step === "source" && selectedType && (
          <div className="p-4 space-y-2">
            <button onClick={() => setStep("type")} className="text-[12px] text-blue-600 hover:text-blue-800 mb-2">
              &larr; Volver a tipos
            </button>
            {DATA_SOURCES.map((ds) => (
              <button
                key={ds.key}
                onClick={() => { onAdd(selectedType, ds.key); onClose(); }}
                className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-[#ea580c] hover:bg-orange-50/50 transition-all"
              >
                <div className="text-sm font-semibold text-gray-800">{ds.label}</div>
                <div className="text-[10px] text-gray-400">
                  {ds.type === "single" ? "Valor unico" : "Lista"} | {ds.fields.map(f => f.label).join(", ")}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


export default WidgetCatalog;
