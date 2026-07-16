import { useState, useMemo } from "react";
import ElasticSlider from "./ui/ElasticSlider";

export default function AlertasOperacionalesSection({ alertasOp }) {
  const [umbral, setUmbral] = useState(1);
  const maxCantidad = useMemo(
    () => Math.max(1, ...alertasOp.map((a) => a.cantidad)),
    [alertasOp]
  );
  const filtradas = useMemo(
    () => alertasOp.filter((a) => a.cantidad >= umbral),
    [alertasOp, umbral]
  );

  if (alertasOp.length === 0) return null;
  return (
    <div className="table-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <h3 className="font-bold text-gray-800">Alertas Operacionales</h3>
          <p className="text-[11px] text-gray-400">NVs estancadas más tiempo del umbral en cada estado.</p>
        </div>
        <div className="w-full sm:w-56 shrink-0">
          <ElasticSlider
            min={1}
            max={maxCantidad}
            value={Math.min(umbral, maxCantidad)}
            onChange={setUmbral}
            label="Mínimo de NVs"
            color="#c62828"
          />
        </div>
      </div>
      {filtradas.length === 0 ? (
        <p className="text-[12px] text-gray-400 py-4 text-center">Ningún estado supera el umbral de {umbral} NV{umbral !== 1 ? "s" : ""}.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filtradas.map((a) => (
            <div key={a.estado} className="rounded-xl bg-red-50 p-3 border-glow-red">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-semibold text-red-800">{a.estado}</span>
                <span className="text-[14px] font-bold text-red-600">{a.cantidad}</span>
              </div>
              <p className="text-[10px] text-red-500 truncate">
                NVs: {a.nvs.join(", ")}{a.cantidad > a.nvs.length ? ` (+${a.cantidad - a.nvs.length})` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
