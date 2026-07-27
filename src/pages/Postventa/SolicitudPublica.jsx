import { useState, useRef, useMemo } from 'react';
import { supabase } from '../../supabase';
import { CheckCircle2, Send, LifeBuoy, AlertCircle } from 'lucide-react';
import {
  PV_TIPOS_SOLICITUD,
  PV_PRIORIDADES,
  PV_REGIONES,
  PV_COTIZAR
} from '../../services/postventaService';
import { comunasDeRegion } from '../../constants/comunasChile';

// ============================================================================
// Formulario PÚBLICO de solicitud de servicio (sin login).
// Ruta abierta /soporte. Cualquier cliente o vendedor puede crear un ticket.
// Va a la Edge Function `postventa-publico` (verify_jwt off) que aplica el
// anti-spam (honeypot + tiempo mínimo + rate-limit + Turnstile opcional) y crea
// el ticket como BORRADOR (origen='Web'). El Equipo/Modelo es texto libre.
// ============================================================================
const FORM_INICIAL = {
  cliente: '',
  contacto: '',
  equipo_modelo: '',
  numero_serie: '',
  tipo_solicitud: '',
  prioridad: 'Media',
  region: '',
  comuna: '',
  cotizar: 'No',
  descripcion: '',
  observaciones: '',
  // La fecha/hora de visita las agenda el técnico, no el solicitante.
  // estado NO es editable: el ticket público entra SIEMPRE como "Abierto" (flujo de entrada).
  website: '' // honeypot (oculto) — un bot lo llena y se descarta en el server
};

function Campo({ label, req, children, hint }) {
  return (
    <div>
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
        {label}
        {req && <span className="text-orange-500"> *</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition';

export default function SolicitudPublica() {
  const [form, setForm] = useState(FORM_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(null); // { numero }
  const cargadoEn = useRef(Date.now());

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));
  // Al cambiar región se limpia la comuna (dependen en cascada, igual que el ticket interno).
  const setRegion = (e) => setForm((f) => ({ ...f, region: e.target.value, comuna: '' }));
  const comunas = useMemo(() => comunasDeRegion(form.region) || [], [form.region]);
  const puedeEnviar = useMemo(
    () =>
      ['cliente', 'contacto', 'equipo_modelo', 'descripcion'].every((k) => String(form[k]).trim()),
    [form]
  );

  const enviar = async (e) => {
    e?.preventDefault?.();
    if (!puedeEnviar || enviando) return;
    setEnviando(true);
    setError('');
    try {
      const payload = { ...form, t_ms: Date.now() - cargadoEn.current };
      const { data, error: fnErr } = await supabase.functions.invoke('postventa-publico', {
        body: payload
      });
      // functions.invoke marca error en HTTP != 2xx; el cuerpo trae {ok,error}.
      const body = data || (fnErr?.context ? await fnErr.context.json().catch(() => null) : null);
      if (fnErr && !body?.ok)
        throw new Error(body?.error || fnErr.message || 'No se pudo enviar la solicitud.');
      if (!body?.ok) throw new Error(body?.error || 'No se pudo enviar la solicitud.');
      setOk({ numero: body.numero });
    } catch (err) {
      setError(err.message || 'No se pudo enviar la solicitud. Intenta nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  if (ok) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="text-emerald-500" size={40} />
          </div>
          <h1 className="text-xl font-black text-slate-900 mb-1">¡Solicitud recibida!</h1>
          <p className="text-sm text-slate-500 mb-4">
            Hemos registrado tu solicitud de servicio. Nuestro equipo técnico la revisará y se
            pondrá en contacto contigo.
          </p>
          {ok.numero && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-5">
              <p className="text-[11px] font-bold text-orange-600 uppercase tracking-wide">
                Número de folio
              </p>
              <p className="text-2xl font-black text-orange-600 tracking-tight">{ok.numero}</p>
              <p className="text-[11px] text-orange-500/80 mt-1">
                Guarda este número para dar seguimiento.
              </p>
            </div>
          )}
          <button
            onClick={() => {
              setOk(null);
              setForm(FORM_INICIAL);
              cargadoEn.current = Date.now();
            }}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition"
          >
            Crear otra solicitud
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Cabecera de marca */}
        <div className="text-center mb-6">
          <img
            src="/logo-ptm.png"
            alt="PTM Health Care"
            className="h-14 mx-auto mb-3 object-contain"
          />
          <div className="inline-flex items-center gap-2 text-orange-600 font-black text-lg">
            <LifeBuoy size={20} /> Solicitud de Servicio Técnico
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-lg mx-auto">
            Completa este formulario para solicitar servicio, mantención o reportar una falla.
            Recibirás un número de folio para dar seguimiento.
          </p>
        </div>

        <form
          onSubmit={enviar}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-4"
        >
          {/* Honeypot — oculto para humanos, tentador para bots */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={set('website')}
            className="hidden"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Empresa / Cliente" req>
              <input
                className={inputCls}
                value={form.cliente}
                onChange={set('cliente')}
                placeholder="Nombre de la empresa o cliente"
                maxLength={300}
              />
            </Campo>
            <Campo label="Contacto" req hint="Nombre, teléfono o correo para ubicarte.">
              <input
                className={inputCls}
                value={form.contacto}
                onChange={set('contacto')}
                placeholder="Nombre y teléfono / correo"
                maxLength={300}
              />
            </Campo>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo
              label="Equipo / Modelo"
              req
              hint="Si no conoces el modelo exacto, describe el equipo."
            >
              <input
                className={inputCls}
                value={form.equipo_modelo}
                onChange={set('equipo_modelo')}
                placeholder="Ej: Monitor multiparámetro, Cardiomax…"
                maxLength={300}
              />
            </Campo>
            <Campo label="N° de serie" hint="Opcional.">
              <input
                className={inputCls}
                value={form.numero_serie}
                onChange={set('numero_serie')}
                placeholder="Opcional"
                maxLength={120}
              />
            </Campo>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Campo label="Tipo de solicitud">
              <select
                className={inputCls}
                value={form.tipo_solicitud}
                onChange={set('tipo_solicitud')}
              >
                <option value="">Selecciona…</option>
                {PV_TIPOS_SOLICITUD.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Prioridad">
              <select className={inputCls} value={form.prioridad} onChange={set('prioridad')}>
                {PV_PRIORIDADES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="¿Cotizar?">
              <select className={inputCls} value={form.cotizar} onChange={set('cotizar')}>
                {PV_COTIZAR.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Región">
              <select className={inputCls} value={form.region} onChange={setRegion}>
                <option value="">Selecciona…</option>
                {PV_REGIONES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo
              label="Comuna"
              hint={form.region ? 'Escribe o elige de la lista.' : 'Selecciona primero la región.'}
            >
              <input
                className={inputCls}
                list="dl-comunas"
                value={form.comuna}
                onChange={set('comuna')}
                disabled={!form.region}
                placeholder={form.region ? 'Comuna' : 'Opcional'}
                maxLength={120}
              />
              <datalist id="dl-comunas">
                {comunas.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Campo>
          </div>

          <Campo label="Descripción del problema o solicitud" req>
            <textarea
              className={`${inputCls} min-h-[120px] resize-y`}
              value={form.descripcion}
              onChange={set('descripcion')}
              placeholder="Describe la falla, el servicio requerido o el motivo de la solicitud con el mayor detalle posible."
              maxLength={5000}
            />
          </Campo>

          <Campo
            label="Observaciones"
            hint="Opcional — cualquier dato adicional que quieras agregar."
          >
            <textarea
              className={`${inputCls} min-h-[80px] resize-y`}
              value={form.observaciones}
              onChange={set('observaciones')}
              placeholder="Información complementaria (horarios de atención, referencias, etc.)"
              maxLength={5000}
            />
          </Campo>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!puedeEnviar || enviando}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition"
          >
            <Send size={16} /> {enviando ? 'Enviando…' : 'Enviar solicitud'}
          </button>
          <p className="text-[11px] text-center text-slate-400">
            PTM Health Care · Los datos enviados se usan únicamente para gestionar tu solicitud de
            servicio.
          </p>
        </form>
      </div>
    </div>
  );
}
