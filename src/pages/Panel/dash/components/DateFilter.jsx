import { useState } from "react";
import { hoyChile, sumaDias } from "../dashHelpers";

function getSaved(key, fallback) {
  if (typeof window === "undefined") return fallback;
  return localStorage.getItem(key) || fallback;
}

function saveFilter(from, to) {
  localStorage.setItem("panel_filter_from", from);
  localStorage.setItem("panel_filter_to", to);
}

export default function DateFilter({ onFilter, defaultFrom, defaultTo }) {
  const [from, setFrom] = useState(() => getSaved("panel_filter_from", defaultFrom));
  const [to, setTo] = useState(() => getSaved("panel_filter_to", defaultTo));

  function apply(f, t) {
    setFrom(f);
    setTo(t);
    saveFilter(f, t);
    onFilter(f, t);
  }

  const presets = [
    { label: "Última semana", days: 7 },
    { label: "Último mes", days: 30 },
    { label: "Últimos 3 meses", days: 90 },
    { label: "Año completo", days: 365 },
  ];

  function applyPreset(days) {
    // Anclado a hora de Chile (evita corrimiento de un día por UTC en la noche).
    const end = hoyChile();
    apply(sumaDias(end, -days), end);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
        />
        <span className="text-gray-400 text-sm">a</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
        />
        <button
          onClick={() => apply(from, to)}
          className="px-4 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
        >
          Filtrar
        </button>
      </div>
      <div className="flex gap-1">
        {presets.map((p) => (
          <button
            key={p.days}
            onClick={() => applyPreset(p.days)}
            className="px-3 py-1 text-xs rounded-full border border-gray-200 text-gray-600 hover:bg-orange-50 hover:border-orange-300 transition"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
