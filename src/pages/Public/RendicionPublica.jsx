import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Camera,
  Download,
  Eye,
  FileSpreadsheet,
  Plus,
  ShieldCheck,
  Trash2,
  UploadCloud
} from 'lucide-react';
import { toast } from 'sonner';
import { rendicionesPublicas, optimizePhoto } from '../../services/rendicionesService';
import {
  cleanHumanText,
  emptyRendicionItem,
  TIPOS_DOCUMENTO,
  validateRendicion
} from '../../lib/rendicionValidation';
import { downloadRendicionExcel, downloadRendicionPDF } from '../../lib/exportRendicion';
import './RendicionPublica.css';

const money = (value) => `$ ${Number(value || 0).toLocaleString('es-CL')}`;

function LoadingCard({ text = 'Cargando formulario seguro…' }) {
  return (
    <main className="rp-shell">
      <section className="rp-status">
        <span className="rp-spinner" />
        <h2>{text}</h2>
      </section>
    </main>
  );
}

function ReportView({ token, reportId, viewToken }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    rendicionesPublicas
      .view(token, reportId, viewToken)
      .then((result) => setData(result.data))
      .catch((e) => setError(e.message));
  }, [token, reportId, viewToken]);
  if (error)
    return (
      <main className="rp-shell">
        <section className="rp-status rp-error">
          <ShieldCheck />
          <h2>No se pudo abrir la rendición</h2>
          <p>{error}</p>
        </section>
      </main>
    );
  if (!data) return <LoadingCard text="Abriendo rendición…" />;
  const r = data.rendicion;
  return (
    <main className="rp-shell rp-view-shell">
      <header className="rp-topbar">
        <img src="/logo-ptm.png" alt="PTM" />
        <div>
          <span>Documento protegido</span>
          <h1>{r.folio_texto}</h1>
        </div>
        <div className="rp-actions">
          <button
            disabled={!r.cabecera_completa}
            title={
              !r.cabecera_completa ? 'Oscar debe completar la rendición antes de exportar' : ''
            }
            onClick={() => downloadRendicionPDF(data)}
          >
            <Download size={17} /> Descargar PDF
          </button>
          <button
            className="secondary"
            disabled={!r.cabecera_completa}
            onClick={() => downloadRendicionExcel(data)}
          >
            <FileSpreadsheet size={17} /> Excel
          </button>
        </div>
      </header>
      {!r.cabecera_completa && (
        <section className="rp-pending-admin">
          <ShieldCheck size={20} />
          <div>
            <b>Detalle recibido correctamente</b>
            <span>
              Oscar completará los datos administrativos. La descarga se habilitará después.
            </span>
          </div>
        </section>
      )}
      <section className="rp-paper">
        <h2>PLANILLA DE RENDICIÓN DE GASTOS</h2>
        <div className="rp-summary">
          <div>
            <b>Responsable rendición</b>
            <span>{r.responsable_nombre}</span>
          </div>
          <div>
            <b>Fecha de la rendición</b>
            <span>{new Date(`${r.fecha_rendicion}T12:00:00`).toLocaleDateString('es-CL')}</span>
          </div>
          <div>
            <b>RUT del responsable</b>
            <span>{r.responsable_rut || '—'}</span>
          </div>
          <div>
            <b>Nº folio solicitud</b>
            <span>{r.folio_texto}</span>
          </div>
          <div>
            <b>Dirección - área</b>
            <span>{r.direccion_area || '—'}</span>
          </div>
          <div>
            <b>Fondo por rendir</b>
            <span>{r.tipo_fondo === 'Fondo por rendir' ? money(r.fondo_por_rendir) : '—'}</span>
          </div>
          <div>
            <b>Unidad</b>
            <span>{r.unidad || '—'}</span>
          </div>
          <div>
            <b>Centro de costo</b>
            <span>{r.centro_costo_nombre || '—'}</span>
          </div>
          <div>
            <b>Técnico</b>
            <span>{r.solicitante_tecnico_nombre || r.tecnico || '—'}</span>
          </div>
          <div>
            <b>Detalle</b>
            <span>{r.detalle || '—'}</span>
          </div>
        </div>
        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Fecha</th>
                <th>Nº Bol/Fac</th>
                <th>Detalle descripción de gasto</th>
                <th>CC</th>
                <th>Categoría</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.orden}</td>
                  <td>{new Date(`${item.fecha}T12:00:00`).toLocaleDateString('es-CL')}</td>
                  <td>{item.numero_documento || '—'}</td>
                  <td>
                    {item.descripcion}
                    <small>
                      {item.subcategoria_nombre} · {item.tipo_documento}
                    </small>
                  </td>
                  <td>{r.centro_costo_codigo}</td>
                  <td>{item.categoria_nombre}</td>
                  <td className="money">$ {Number(item.monto).toLocaleString('es-CL')}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="6">Total General</td>
                <td>$ {Number(r.total).toLocaleString('es-CL')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
      {data.fotos.length > 0 && (
        <section className="rp-paper">
          <h2>EVIDENCIAS</h2>
          <div className="rp-gallery">
            {data.fotos.map((photo) => (
              <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer">
                <img src={photo.url} alt="Comprobante" />
                <span>
                  <Eye size={15} /> Abrir original
                </span>
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default function RendicionPublica() {
  const { token, reportId, viewToken } = useParams();
  const navigate = useNavigate();
  const startedAt = useRef(Date.now());
  const [catalogs, setCatalogs] = useState(null);
  const [linkName, setLinkName] = useState('');
  const [loadError, setLoadError] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(null);
  const [website, setWebsite] = useState('');
  const [form, setForm] = useState({
    solicitante_tecnico_id: '',
    items: [emptyRendicionItem()]
  });

  useEffect(() => {
    document.title = 'Rendición de gastos · PTM';
    document.documentElement.style.setProperty('background', '#f4f7fb');
    if (!reportId)
      rendicionesPublicas
        .bootstrap(token)
        .then((result) => {
          setCatalogs(result.catalogs);
          setLinkName(result.link?.nombre || 'Rendición de gastos');
        })
        .catch((e) => setLoadError(e.message));
  }, [token, reportId]);

  const subcategories = useMemo(() => {
    const byCode = Object.fromEntries((catalogs?.subcategorias || []).map((s) => [s.codigo, s]));
    return (catalogs?.relaciones || []).reduce((acc, relation) => {
      (acc[relation.categoria_codigo] ||= []).push(byCode[relation.subcategoria_codigo]);
      return acc;
    }, {});
  }, [catalogs]);
  const selectedTechnician = useMemo(
    () => catalogs?.tecnicos?.find((person) => person.id === form.solicitante_tecnico_id) || null,
    [catalogs, form.solicitante_tecnico_id]
  );

  if (reportId && viewToken)
    return <ReportView token={token} reportId={reportId} viewToken={viewToken} />;
  if (loadError)
    return (
      <main className="rp-shell">
        <section className="rp-status rp-error">
          <ShieldCheck />
          <h2>Enlace no disponible</h2>
          <p>{loadError}</p>
        </section>
      </main>
    );
  if (!catalogs) return <LoadingCard />;

  const setItem = (index, field, value) =>
    setForm((current) => ({
      ...current,
      items: current.items.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
              ...(field === 'categoria_codigo' ? { subcategoria_codigo: '' } : {})
            }
          : item
      )
    }));
  const removeItem = (index) =>
    setForm((current) => ({ ...current, items: current.items.filter((_, i) => i !== index) }));
  const addPhotos = async (index, files) => {
    const currentCount = form.items.reduce((total, item) => total + item.photos.length, 0);
    const available = Math.min(3 - form.items[index].photos.length, 10 - currentCount);
    if (available <= 0) return toast.error('Máximo 3 fotos por gasto y 10 por rendición.');
    try {
      const optimized = [];
      for (const file of [...files].slice(0, available)) optimized.push(await optimizePhoto(file));
      setItem(index, 'photos', [...form.items[index].photos, ...optimized]);
      toast.success('Foto optimizada y lista para subir.');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      items: form.items.map(({ photos: _photos, ...item }) => ({
        ...item,
        descripcion: cleanHumanText(item.descripcion),
        numero_documento: cleanHumanText(item.numero_documento),
        monto: Number(item.monto)
      }))
    };
    const found = validateRendicion(payload);
    setErrors(found);
    if (Object.keys(found).length)
      return toast.error('Revisa los campos marcados antes de enviar.');
    setBusy(true);
    try {
      const result = await rendicionesPublicas.submit(token, payload, startedAt.current, website);
      if (result.ignored) return;
      const itemMap = Object.fromEntries(
        result.report.items.map((item) => [item.client_id, item.id])
      );
      const uploads = form.items.flatMap((item) =>
        item.photos.map((photo) => ({ photo, itemId: itemMap[item.client_id] }))
      );
      let failed = 0;
      for (const upload of uploads) {
        try {
          await rendicionesPublicas.upload(
            token,
            result.view_token,
            result.report.id,
            upload.itemId,
            upload.photo
          );
        } catch {
          failed += 1;
        }
      }
      if (failed)
        toast.warning(`La rendición fue creada, pero ${failed} foto(s) no pudieron subirse.`);
      const basePath = token ? `/rendiciones/${token}` : '/rendiciones';
      setSuccess({
        folio: result.report.folio,
        total: result.report.total,
        viewPath: `${basePath}/ver/${result.report.id}/${result.view_token}`,
        failed
      });
      setForm({
        solicitante_tecnico_id: form.solicitante_tecnico_id,
        items: [emptyRendicionItem()]
      });
      setErrors({});
      startedAt.current = Date.now();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const fieldError = (key) =>
    errors[key] ? <small className="rp-field-error">{errors[key]}</small> : null;
  return (
    <main className="rp-shell">
      <header className="rp-topbar">
        <img src="/logo-ptm.png" alt="PTM" />
        <div>
          <span>Formulario público protegido</span>
          <h1>Rendición de gastos</h1>
          <p>{linkName}</p>
        </div>
        <div className="rp-security">
          <ShieldCheck size={20} /> Fotos privadas
          <br />
          Datos validados
        </div>
      </header>
      <form className="rp-form" onSubmit={submit} noValidate>
        <input
          className="rp-honeypot"
          tabIndex="-1"
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          name="website"
        />
        <section className="rp-identity-strip">
          <div>
            <ShieldCheck size={20} />
            <span>
              <b>Identifica quién envía</b>
              Solo se aceptan técnicos registrados en Postventa.
            </span>
          </div>
          <label>
            Técnico Postventa *
            <select
              value={form.solicitante_tecnico_id}
              onChange={(e) => setForm({ ...form, solicitante_tecnico_id: e.target.value })}
            >
              <option value="">Selecciona tu nombre…</option>
              {(catalogs.tecnicos || []).map((person) => (
                <option key={person.id} value={person.id}>
                  {person.nombre}
                </option>
              ))}
            </select>
            {fieldError('solicitante_tecnico_id')}
          </label>
          {selectedTechnician && (
            <b className="rp-identity-confirmed">✓ {selectedTechnician.nombre}</b>
          )}
        </section>
        <section className="rp-card">
          <div className="rp-card-title">
            <span>02</span>
            <div>
              <h2>Detalle de gastos</h2>
              <p>Agrega hasta 15 líneas. Cada descripción debe contener palabras reales.</p>
            </div>
            <b>{form.items.length}/15</b>
          </div>
          {form.items.map((item, index) => (
            <article className="rp-expense" key={item.client_id}>
              <div className="rp-expense-head">
                <h3>Gasto {index + 1}</h3>
                {form.items.length > 1 && (
                  <button
                    type="button"
                    className="icon-danger"
                    onClick={() => removeItem(index)}
                    aria-label="Eliminar gasto"
                  >
                    <Trash2 size={17} />
                  </button>
                )}
              </div>
              <div className="rp-grid rp-grid-item">
                <label>
                  Fecha *
                  <input
                    type="date"
                    max={new Date().toLocaleDateString('en-CA')}
                    value={item.fecha}
                    onChange={(e) => setItem(index, 'fecha', e.target.value)}
                  />
                  {fieldError(`items.${index}.fecha`)}
                </label>
                <label>
                  Categoría *
                  <select
                    value={item.categoria_codigo}
                    onChange={(e) => setItem(index, 'categoria_codigo', e.target.value)}
                  >
                    <option value="">Seleccionar…</option>
                    {catalogs.categorias.map((cat) => (
                      <option key={cat.codigo} value={cat.codigo}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                  {fieldError(`items.${index}.categoria_codigo`)}
                </label>
                <label>
                  Subcategoría *
                  <select
                    disabled={!item.categoria_codigo}
                    value={item.subcategoria_codigo}
                    onChange={(e) => setItem(index, 'subcategoria_codigo', e.target.value)}
                  >
                    <option value="">Seleccionar…</option>
                    {(subcategories[item.categoria_codigo] || []).filter(Boolean).map((sub) => (
                      <option key={sub.codigo} value={sub.codigo}>
                        {sub.nombre}
                      </option>
                    ))}
                  </select>
                  {fieldError(`items.${index}.subcategoria_codigo`)}
                </label>
                <label>
                  Monto *
                  <input
                    type="number"
                    min="1"
                    max="999999999"
                    step="1"
                    inputMode="numeric"
                    placeholder="$ 0"
                    value={item.monto}
                    onChange={(e) => setItem(index, 'monto', e.target.value)}
                  />
                  {fieldError(`items.${index}.monto`)}
                </label>
                <label className="rp-full">
                  Descripción *
                  <textarea
                    maxLength="800"
                    placeholder="Ej.: Compra de materiales para reparación de bodega"
                    value={item.descripcion}
                    onChange={(e) => setItem(index, 'descripcion', e.target.value)}
                  />
                  {fieldError(`items.${index}.descripcion`)}
                </label>
                <label>
                  Documento *
                  <select
                    value={item.tipo_documento}
                    onChange={(e) => setItem(index, 'tipo_documento', e.target.value)}
                  >
                    <option value="">Seleccionar…</option>
                    {TIPOS_DOCUMENTO.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                  {fieldError(`items.${index}.tipo_documento`)}
                </label>
                <label>
                  Nº de documento
                  <input
                    maxLength="80"
                    placeholder="Ej.: 195987"
                    value={item.numero_documento}
                    onChange={(e) => setItem(index, 'numero_documento', e.target.value)}
                  />
                  {fieldError(`items.${index}.numero_documento`)}
                </label>
                <label className="rp-photo-input">
                  <span>Escáner de comprobante</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                    capture="environment"
                    multiple
                    onChange={(e) => {
                      addPhotos(index, e.target.files);
                      e.target.value = '';
                    }}
                  />
                  <b>
                    <Camera size={18} /> Escanear con cámara
                  </b>
                  <small>
                    {item.photos.length}/3 · Captura trasera, recorte y optimización automática
                  </small>
                </label>
                {item.photos.length > 0 && (
                  <div className="rp-previews">
                    {item.photos.map((photo, photoIndex) => (
                      <figure key={`${photo.name}-${photoIndex}`}>
                        <img src={URL.createObjectURL(photo)} alt="Vista previa" />
                        <button
                          type="button"
                          onClick={() =>
                            setItem(
                              index,
                              'photos',
                              item.photos.filter((_, i) => i !== photoIndex)
                            )
                          }
                        >
                          <Trash2 size={14} />
                        </button>
                      </figure>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
          {form.items.length < 15 && (
            <button
              type="button"
              className="rp-add"
              onClick={() => setForm({ ...form, items: [...form.items, emptyRendicionItem()] })}
            >
              <Plus size={18} /> Agregar otro gasto
            </button>
          )}
          {fieldError('items')}
        </section>
        <footer className="rp-submit">
          <div>
            <ShieldCheck size={18} />
            <span>
              <b>Envío cifrado</b>
              <small>Las fotos no son públicas y los enlaces de visualización expiran.</small>
            </span>
          </div>
          <button type="submit" disabled={busy}>
            {busy ? (
              <>
                <span className="rp-spinner" /> Guardando…
              </>
            ) : (
              <>
                <UploadCloud size={19} /> Enviar rendición
              </>
            )}
          </button>
        </footer>
      </form>
      {success && (
        <div className="rp-success-backdrop" role="dialog" aria-modal="true">
          <section className="rp-success-card">
            <span className="rp-success-check">✓</span>
            <small>Rendición guardada correctamente</small>
            <h2>{success.folio}</h2>
            <p>
              Se notificó a Oscar Leiva y el formulario ya quedó limpio para registrar una nueva
              rendición.
            </p>
            <strong>{money(success.total)}</strong>
            <div>
              <button type="button" onClick={() => navigate(success.viewPath)}>
                <Eye size={17} /> Ver comprobante
              </button>
              <button type="button" className="primary" onClick={() => setSuccess(null)}>
                <Plus size={17} /> Nueva rendición
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
