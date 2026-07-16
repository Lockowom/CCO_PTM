import { create } from "zustand";
import { ESTADOS } from "../estados";
import { calcFechaCompromiso } from "../helpers";

// ============================================================
//  Estado global: formulario "Ingresar NV" de /ingresar
// ============================================================
// Centraliza las ~25 piezas de estado del formulario individual. El componente
// <FormNV> lee/escribe este store directo; la página conserva la ORQUESTACIÓN
// (handleLookup/handleSubmit/handleNewEntry): hace el fetch al backend, registra
// en el session-log y refresca la lista. La lógica de guardado y el bloqueo
// optimista NO viven aquí — solo el estado de UI del form.

// Estado en blanco de los campos del formulario (sin acciones).
const BLANK = {
  nv: "",
  lookupResult: null,
  lookupLoading: false,
  mode: "idle",
  estado: ESTADOS.EN_PROCESO,
  tipoDespacho: "",
  transportista: "",
  fechaCompromiso: "",
  fechaAprobacion: "",
  fechaAprobacionReal: "",
  fechaFacturacion: "",
  fechaDespacho: "",
  factura: "",
  guia: "",
  bultos: "",
  valorFactura: "",
  numeroEnvio: "",
  urgente: false,
  variosTipo: "",
  variosCliente: "",
  variosVendedor: "",
  variosDivision: "",
  variosCcosto: "",
  submitting: false,
  submitResult: null,
  errors: [],
  autoFilledDates: new Set(),
  estadoOpen: false,
  estadoQuery: "",
};

export const useFormNVStore = create((set) => ({
  canal: "ptm",
  ...BLANK,

  patch: (p) => set(p),

  markAutoFilled: (keys) =>
    set((s) => {
      const next = new Set(s.autoFilledDates);
      keys.forEach((k) => next.add(k));
      return { autoFilledDates: next };
    }),

  clearAutoFilled: (key) =>
    set((s) => {
      const next = new Set(s.autoFilledDates);
      next.delete(key);
      return { autoFilledDates: next };
    }),

  // reset NO toca `canal` a propósito: "Nueva NV" conserva el canal elegido,
  // igual que el handleNewEntry original (que sí limpiaba todo lo demás).
  reset: () =>
    set({
      ...BLANK,
      variosTipo: "",
      variosCliente: "",
      variosVendedor: "",
      variosDivision: "",
      variosCcosto: "",
    }),

  applyFound: (data) =>
    set(() => {
      const fc = data.fecha_compromiso || calcFechaCompromiso(data.fecha_aprobacion, data.fecha_aprobacion_real);
      const wasAuto = !data.fecha_compromiso && !!fc;
      return {
        mode: "update",
        estado: data.estado || ESTADOS.EN_PROCESO,
        tipoDespacho: data.tipo_despacho || "",
        transportista: data.transportista || "",
        fechaCompromiso: fc,
        fechaAprobacion: data.fecha_aprobacion || "",
        fechaAprobacionReal: data.fecha_aprobacion_real || "",
        fechaFacturacion: data.fecha_facturacion || "",
        fechaDespacho: data.fecha_despacho || "",
        factura: data.factura || "",
        guia: data.guia || "",
        bultos: data.bultos ? String(data.bultos) : "",
        valorFactura: data.valor_factura ? String(data.valor_factura) : "",
        numeroEnvio: data.numero_envio || "",
        urgente: String(data.urgente) === "true" || data.urgente === true,
        autoFilledDates: wasAuto ? new Set(["fechaCompromiso"]) : new Set(),
      };
    }),

  applyNew: (autoFill) =>
    set(() => {
      const autoFC = (autoFill && autoFill.fecha_compromiso) || "";
      return {
        mode: "create",
        estado: ESTADOS.EN_PROCESO,
        tipoDespacho: "",
        transportista: "",
        fechaCompromiso: autoFC,
        fechaAprobacion: "",
        fechaAprobacionReal: "",
        fechaFacturacion: "",
        fechaDespacho: "",
        factura: "",
        guia: "",
        bultos: "",
        valorFactura: "",
        numeroEnvio: "",
        urgente: false,
        autoFilledDates: autoFC ? new Set(["fechaCompromiso"]) : new Set(),
      };
    }),

  recalcCompromiso: () =>
    set((s) => {
      if (s.mode === "idle") return s;
      const fc = calcFechaCompromiso(s.fechaAprobacion, s.fechaAprobacionReal);
      if (!fc || fc === s.fechaCompromiso) return s;
      const next = new Set(s.autoFilledDates);
      next.add("fechaCompromiso");
      return { fechaCompromiso: fc, autoFilledDates: next };
    }),
}));
