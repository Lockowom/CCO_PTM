import { useEffect, useMemo } from "react";
import { useFormNVStore } from "../store/useFormNVStore";
import { ESTADOS, ESTADOS_SELECCIONABLES, estampaDespacho } from "../estados";
import PillNavCanal from "./PillNavCanal";
import PillNavEstado from "./PillNavEstado";
import { CANALES, VARIOS_TIPOS, colorFor, ACCENT } from "../ingresarService";

/**
 * Formulario "Ingresar NV" — presentacional. Lee/escribe TODO su estado desde
 * useFormNVStore (sin prop-drilling). La página solo le pasa opciones de catálogo
 * y el callback de lookup; el guardado (handleSubmit) lo dispara la barra inferior.
 */
export default function FormNV({ options, transportistasOpts, vendedoresMaestro, onLookup }) {
  const s = useFormNVStore();
  const {
    canal, nv, lookupResult, lookupLoading, mode,
    estado, tipoDespacho, transportista, fechaCompromiso, fechaAprobacion,
    fechaAprobacionReal, fechaFacturacion, fechaDespacho,
    factura, guia, bultos, valorFactura, numeroEnvio, urgente,
    variosTipo, variosCliente, variosVendedor, variosDivision, variosCcosto,
    errors, submitResult, autoFilledDates,
    patch, markAutoFilled, clearAutoFilled, recalcCompromiso,
  } = s;

  // Auto-rellenar fechas según el estado elegido. Shipping estampa facturación;
  // los estados de despacho estampan despacho + facturación. La pertenencia se
  // decide con helpers de estados.js (sin arrays en MAYÚSCULAS hardcodeados).
  useEffect(() => {
    if (mode === "idle") return;
    const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" });
    const despacha = estampaDespacho(estado);
    const esShipping = estado.toUpperCase() === ESTADOS.SHIPPING.toUpperCase();
    const patchObj = {};
    const added = [];
    if (despacha && !fechaDespacho) { patchObj.fechaDespacho = hoy; added.push("fechaDespacho"); }
    if ((esShipping || despacha) && !fechaFacturacion) { patchObj.fechaFacturacion = hoy; added.push("fechaFacturacion"); }
    if (added.length > 0) { patch(patchObj); markAutoFilled(added); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, mode]);

  // Auto-calcular fecha compromiso cuando cambia la fecha de aprobación real.
  useEffect(() => {
    if (mode === "idle") return;
    recalcCompromiso();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaAprobacionReal, mode]);

  // Mapa nombre→vendedor (case-insensitive) para auto-rellenar ccosto/división.
  const vendedorPorNombre = useMemo(() => {
    const m = new Map();
    vendedoresMaestro.forEach((v) => m.set(v.nombre.trim().toLowerCase(), v));
    return m;
  }, [vendedoresMaestro]);

  // Al elegir un vendedor del catálogo, auto-rellenar división + centro de costo
  // (editable: el operador puede sobrescribir después).
  const onVendedorChange = (nombre) => {
    const match = vendedorPorNombre.get(nombre.trim().toLowerCase());
    if (match) {
      patch({
        variosVendedor: nombre,
        variosDivision: match.division || "",
        variosCcosto: match.centro_costo || "",
      });
    } else {
      patch({ variosVendedor: nombre });
    }
  };

  return (
    <div className="anim-fade-up space-y-4">
      {/* Identificación */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Identificación</h2>
        <label className="field-label">Canal</label>
        <div className="mb-4">
          <PillNavCanal
            items={CANALES}
            active={canal}
            accent={ACCENT}
            onSelect={(value) => patch({ canal: value, lookupResult: null, mode: "idle" })}
          />
        </div>
        <label className="field-label">N° Nota de Venta</label>
        <div className="flex gap-2">
          <input
            type="text" inputMode="numeric" value={nv}
            onChange={e => {
              const v = e.target.value;
              if (!v.trim() && mode !== "idle") patch({ nv: v, mode: "idle", lookupResult: null, submitResult: null, errors: [] });
              else patch({ nv: v });
            }}
            onKeyDown={e => e.key === "Enter" && onLookup()}
            placeholder="Ej: 97125" className="field-input"
          />
          <button onClick={onLookup} disabled={lookupLoading || !nv.trim()}
            className="px-5 rounded-xl text-white text-sm font-semibold active:scale-95 transition-transform disabled:opacity-40" style={{ background: "#18181b" }}>
            {lookupLoading ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Buscar"}
          </button>
        </div>

        {lookupResult && (
          <div className="mt-4 anim-fade-up">
            <div className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[13px] font-medium ${lookupResult.found ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}`}>
              <span>{lookupResult.found ? "✎" : "✨"}</span>
              {lookupResult.found ? <span>NV encontrada (fila {lookupResult.row}) · <strong>actualizar</strong></span> : <span>NV nueva · <strong>crear</strong></span>}
            </div>
            {(() => {
              const af = lookupResult.found ? lookupResult.data : lookupResult.autoFill;
              if (!af) return null;
              const cells = [
                { l: "Cliente", v: af.cliente },
                { l: "Vendedor", v: af.vendedor },
                { l: "C. Costo", v: af.ccosto || af.centro_costo },
                { l: "División", v: af.division },
              ].filter(x => x.v);
              if (cells.length === 0) return null;
              return (
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  {cells.map(x => (
                    <div key={x.l} className="bg-gray-50 rounded-lg px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">{x.l}</div>
                      <div className="text-[13px] text-gray-700 font-medium truncate">{x.v}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </section>

      {/* Tipo + datos manuales para canal Varios */}
      {canal === "varios" && mode === "create" && (
        <section className="bg-white rounded-2xl border border-orange-200 p-5 anim-fade-up">
          <h2 className="text-[11px] font-semibold text-orange-500 uppercase tracking-wider mb-4">
            {variosTipo || "Varios"} — Datos Manuales
          </h2>
          {/* Selector de tipo */}
          <div className="mb-4">
            <label className="field-label">Tipo *</label>
            <div className="flex flex-wrap gap-2">
              {VARIOS_TIPOS.map(t => (
                <button key={t} type="button" onClick={() => patch({ variosTipo: t })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${variosTipo === t ? "bg-orange-500 text-white border-orange-500 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:bg-orange-50"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="field-label">Nombre del Cliente *</label>
              <input type="text" value={variosCliente} onChange={e => patch({ variosCliente: e.target.value })}
                className="field-input" placeholder="Ej: Hospital Regional" />
            </div>
            <div>
              <label className="field-label">Vendedor *</label>
              {vendedoresMaestro.length > 0 ? (
                <>
                  <input type="text" list="vendedores-list" value={variosVendedor} onChange={e => onVendedorChange(e.target.value)}
                    className="field-input" placeholder="Selecciona o escribe" />
                  <datalist id="vendedores-list">
                    {vendedoresMaestro.map(v => <option key={v.id} value={v.nombre} />)}
                  </datalist>
                </>
              ) : (
                <input type="text" value={variosVendedor} onChange={e => patch({ variosVendedor: e.target.value })}
                  className="field-input" placeholder="Nombre del vendedor" />
              )}
            </div>
            <div>
              <label className="field-label">División <span className="text-gray-400 font-normal">(auto)</span></label>
              <input type="text" value={variosDivision} onChange={e => patch({ variosDivision: e.target.value })}
                className="field-input" placeholder="Ej: DIV. INSTITUCIONAL" />
            </div>
            <div>
              <label className="field-label">Centro Costo <span className="text-gray-400 font-normal">(auto)</span></label>
              <input type="text" value={variosCcosto} onChange={e => patch({ variosCcosto: e.target.value })}
                className="field-input" placeholder="Ej: 1-06" />
            </div>
            <div>
              <label className="field-label">F. Aprobación Real</label>
              <input type="date" value={fechaAprobacionReal} onChange={e => patch({ fechaAprobacionReal: e.target.value })}
                className="field-input" />
            </div>
          </div>
        </section>
      )}

      {/* Logística */}
      {mode !== "idle" && (
        <>
          <section className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Logística</h2>
            <label className="field-label">Estado *</label>
            <div className="mb-5">
              <PillNavEstado
                items={ESTADOS_SELECCIONABLES.map((e) => ({ value: e, label: e, color: colorFor(e) }))}
                active={estado}
                onSelect={(value) => patch({ estado: value })}
              />
            </div>

            {/* Campo URGENTE destacado */}
            <button type="button" onClick={() => patch({ urgente: !urgente })}
              className={`w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 mb-3.5 border-2 transition-all ${urgente ? "bg-red-50 border-red-400 shadow-sm shadow-red-200" : "bg-gray-50 border-gray-200 hover:border-gray-300"}`}>
              <span className="flex items-center gap-2.5">
                <span className={`text-xl transition-transform ${urgente ? "scale-110" : "opacity-40 grayscale"}`}>🚨</span>
                <span className="flex flex-col items-start">
                  <span className={`text-sm font-bold ${urgente ? "text-red-600" : "text-gray-700"}`}>NV Urgente</span>
                  <span className="text-[11px] text-gray-400">Se destaca en el panel TV</span>
                </span>
              </span>
              <span className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${urgente ? "bg-red-500" : "bg-gray-300"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${urgente ? "translate-x-6" : ""}`} />
              </span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="field-label">Tipo Despacho</label>
                <select value={tipoDespacho} onChange={e => patch({ tipoDespacho: e.target.value })} className="field-input">
                  <option value="">— Seleccionar —</option>
                  {(options?.tiposDespacho || ["Courier - Inyección", "Directo", "Courier (Retiro / Pick-up)"]).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Transportista</label>
                {transportistasOpts.length > 0 ? (
                  <select value={transportista} onChange={e => patch({ transportista: e.target.value })} className="field-input">
                    <option value="">— Seleccionar —</option>
                    {(transportista && !transportistasOpts.includes(transportista) ? [transportista, ...transportistasOpts] : transportistasOpts).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                ) : (
                  <input type="text" value={transportista} onChange={e => patch({ transportista: e.target.value })} placeholder="Nombre transportista" className="field-input" />
                )}
              </div>
              {mode === "update" && (
                <div>
                  <label className="field-label">Fecha Compromiso {autoFilledDates.has("fechaCompromiso") ? <span className="ml-1 normal-case" style={{ color: ACCENT }}>(auto — 2 días hábiles)</span> : <span className="ml-1 normal-case text-gray-400">(auto)</span>}</label>
                  <input type="date" value={fechaCompromiso} readOnly className="field-input bg-gray-50 text-gray-500 cursor-not-allowed" />
                </div>
              )}
              <div>
                <label className="field-label">Fecha de Creación de N.V</label>
                <input type="date" value={fechaAprobacion} readOnly className="field-input bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="field-label">Fecha Aprobación Real</label>
                <input type="date" value={fechaAprobacionReal} onChange={e => patch({ fechaAprobacionReal: e.target.value })} className="field-input" />
                <p className="mt-1 text-[10px] leading-tight text-gray-400">Fecha en que realmente se aprobó la NV. Corrige el cálculo de Fecha Compromiso si hubo demora.</p>
              </div>
              <div>
                <label className="field-label">Fecha Facturación {autoFilledDates.has("fechaFacturacion") && <span className="ml-1 normal-case" style={{ color: ACCENT }}>(auto)</span>}</label>
                <input type="date" value={fechaFacturacion} onChange={e => { patch({ fechaFacturacion: e.target.value }); clearAutoFilled("fechaFacturacion"); }} className="field-input" />
              </div>
              <div>
                <label className="field-label">Fecha Despacho {autoFilledDates.has("fechaDespacho") && <span className="ml-1 normal-case" style={{ color: ACCENT }}>(auto)</span>}</label>
                <input type="date" value={fechaDespacho} onChange={e => { patch({ fechaDespacho: e.target.value }); clearAutoFilled("fechaDespacho"); }} className="field-input" />
              </div>
            </div>
          </section>

          <details className="group bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none">
              <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Datos adicionales</h2>
              <span className="text-gray-300 text-xs transition-transform group-open:rotate-180">▼</span>
            </summary>
            <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div><label className="field-label">Facturas</label><input type="text" value={factura} onChange={e => patch({ factura: e.target.value })} className="field-input" /></div>
              <div><label className="field-label">Guía</label><input type="text" value={guia} onChange={e => patch({ guia: e.target.value })} className="field-input" /></div>
              <div><label className="field-label">Bultos</label><input type="number" inputMode="numeric" value={bultos} onChange={e => patch({ bultos: e.target.value })} className="field-input" /></div>
              <div>
                <label className="field-label">Valor Factura</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]">$</span>
                  <input type="text" inputMode="numeric" value={valorFactura} onChange={e => patch({ valorFactura: e.target.value.replace(/[^0-9.]/g, "") })} className="field-input pl-7" />
                </div>
              </div>
              <div><label className="field-label">N° de Envío</label><input type="text" value={numeroEnvio} onChange={e => patch({ numeroEnvio: e.target.value })} className="field-input" /></div>
            </div>
          </details>

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 anim-fade-up">
              {errors.map((e, i) => <p key={i} className="text-[13px] text-red-600 flex items-center gap-1.5"><span>⚠</span>{e}</p>)}
            </div>
          )}
          {submitResult && !submitResult.success && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 anim-fade-up">
              <p className="text-[13px] text-red-600 flex items-center gap-1.5"><span>⚠</span>{submitResult.message}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
