import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Camera,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Globe2,
  Link2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  WalletCards,
  X,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { publicUrl } from '../../lib/publicUrl';
import { signedUrls } from '../../lib/storageUrl';
import { downloadRendicionExcel, downloadRendicionPDF } from '../../lib/exportRendicion';
import { cleanHumanText, hasRealLetters } from '../../lib/rendicionValidation';
import { rendicionesAdmin } from '../../services/rendicionesService';
import './Rendiciones.css';
import './RendicionesExtras.css';

const money = (value) => `$ ${Number(value || 0).toLocaleString('es-CL')}`;

export default function Rendiciones() {
  const { user, hasPermission } = useAuth();
  const canManage =
    hasPermission('manage_rendiciones') || user?.rol === 'ADMIN' || user?.es_admin_delegado;
  const [data, setData] = useState({
    rendiciones: [],
    links: [],
    centros: [],
    colaboradores: [],
    por_tecnico: [],
    storage: {}
  });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState(null);
  const [newLink, setNewLink] = useState({ nombre: '', expires: '', max: '' });
  const [createdUrl, setCreatedUrl] = useState('');
  const [catalog, setCatalog] = useState({
    id: '',
    tipo: 'centro',
    codigo: '',
    nombre: '',
    rut: '',
    direccion_area: '',
    unidad: '',
    tecnico: '',
    activo: true
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboard, colaboradores] = await Promise.all([
        rendicionesAdmin.dashboard(300),
        rendicionesAdmin.colaboradoresDetalle()
      ]);
      setData({ ...dashboard, colaboradores });
    } catch (error) {
      toast.error(error.message || 'No se pudieron cargar las rendiciones.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = query.toLocaleLowerCase('es');
    return data.rendiciones.filter(
      (r) =>
        !term ||
        [
          r.folio,
          r.responsable_nombre,
          r.centro_costo_codigo,
          r.centro_costo_nombre,
          r.estado
        ].some((value) =>
          String(value || '')
            .toLocaleLowerCase('es')
            .includes(term)
        )
    );
  }, [data.rendiciones, query]);

  const openDetail = async (id) => {
    try {
      const found = await rendicionesAdmin.detalle(id);
      const urls = await signedUrls(
        'rendicion-evidencias',
        found.fotos.map((photo) => photo.storage_path),
        900
      );
      found.fotos = found.fotos.map((photo) => ({ ...photo, url: urls[photo.storage_path] || '' }));
      setDetail(found);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteReport = async (report) => {
    if (!canManage) return;
    const confirmation = window.prompt(
      `Esta acción elimina la rendición y sus evidencias. Escribe ${report.folio} para confirmar.`
    );
    if (confirmation !== report.folio) {
      if (confirmation != null) toast.error('El folio no coincide. No se eliminó nada.');
      return;
    }
    try {
      await rendicionesAdmin.eliminar(report.id);
      if (detail?.rendicion?.id === report.id) setDetail(null);
      toast.success(`${report.folio} eliminada y registrada en auditoría.`);
      await load();
    } catch (error) {
      toast.error(error.message || 'No se pudo eliminar la rendición.');
    }
  };

  const createLink = async (event) => {
    event.preventDefault();
    const name = cleanHumanText(newLink.nombre);
    if (!hasRealLetters(name) || name.length < 3)
      return toast.error('El nombre debe contener letras reales.');
    try {
      const created = await rendicionesAdmin.crearLink(
        name,
        newLink.expires ? new Date(newLink.expires).toISOString() : null,
        newLink.max
      );
      const url = publicUrl(`/rendiciones/${created.token}`);
      setCreatedUrl(url);
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Enlace creado y copiado.');
      } catch {
        toast.success('Enlace creado. Cópialo desde el recuadro verde.');
      }
      setNewLink({ nombre: '', expires: '', max: '' });
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const saveCatalog = async (event) => {
    event.preventDefault();
    if (!hasRealLetters(catalog.nombre))
      return toast.error('El nombre debe contener letras reales.');
    try {
      const payload = {
        ...catalog,
        id: catalog.id || null,
        codigo: cleanHumanText(catalog.codigo),
        nombre: cleanHumanText(catalog.nombre),
        rut: cleanHumanText(catalog.rut),
        direccion_area: cleanHumanText(catalog.direccion_area),
        unidad: cleanHumanText(catalog.unidad),
        tecnico: cleanHumanText(catalog.tecnico),
        activo: catalog.activo
      };
      if (catalog.tipo === 'colaborador') await rendicionesAdmin.guardarColaboradorDetalle(payload);
      else await rendicionesAdmin.guardarCatalogo(catalog.tipo, payload);
      toast.success('Catálogo actualizado.');
      setCatalog({
        id: '',
        tipo: catalog.tipo,
        codigo: '',
        nombre: '',
        rut: '',
        direccion_area: '',
        unidad: '',
        tecnico: '',
        activo: true
      });
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const selectCatalogItem = (id) => {
    const items = catalog.tipo === 'centro' ? data.centros : data.colaboradores;
    const item = items.find((candidate) => candidate.id === id);
    setCatalog({
      id: item?.id || '',
      tipo: catalog.tipo,
      codigo: item?.codigo || '',
      nombre: item?.nombre || '',
      rut: item?.rut || '',
      direccion_area: item?.direccion_area || '',
      unidad: item?.unidad || '',
      tecnico: item?.tecnico || '',
      activo: item?.activo ?? true
    });
  };

  const copyTechnicianLink = async () => {
    const url = publicUrl('/rendiciones');
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Enlace público copiado. Ya puedes enviarlo a los técnicos.');
    } catch {
      toast.info(url, { description: 'Copia este enlace para compartirlo.' });
    }
  };

  const usedMb = Number(data.storage?.bytes || 0) / 1024 / 1024;
  const percent = Math.min(100, (usedMb / 1024) * 100);
  return (
    <main className="ra-page">
      <header className="ra-header">
        <div className="ra-icon">
          <WalletCards />
        </div>
        <div>
          <span>ADMINISTRACIÓN · FINANZAS</span>
          <h1>Rendiciones de gastos</h1>
          <p>Enlaces públicos seguros, comprobantes privados y exportación contable.</p>
        </div>
        <button onClick={load} disabled={loading}>
          <RefreshCw size={17} className={loading ? 'spin' : ''} /> Actualizar
        </button>
      </header>
      <section className="ra-metrics">
        <article>
          <WalletCards />
          <div>
            <b>{data.rendiciones.length}</b>
            <span>Rendiciones registradas</span>
          </div>
        </article>
        <article>
          <Link2 />
          <div>
            <b>{data.links.filter((link) => link.activo).length}</b>
            <span>Enlaces activos</span>
          </div>
        </article>
        <article>
          <Camera />
          <div>
            <b>{data.storage?.archivos || 0}</b>
            <span>Fotos privadas</span>
          </div>
        </article>
        <article>
          <ShieldCheck />
          <div>
            <b>{usedMb.toFixed(1)} MB</b>
            <span>de 1.024 MB del plan Free</span>
            <i>
              <em style={{ width: `${percent}%` }} />
            </i>
          </div>
        </article>
      </section>

      {data.por_tecnico?.length > 0 && (
        <section className="ra-people-dashboard">
          <div className="ra-title">
            <Users />
            <div>
              <h2>Actividad por técnico</h2>
              <p>Quién realizó la rendición, cantidad, total y última fecha registrada.</p>
            </div>
          </div>
          <div className="ra-people-grid">
            {data.por_tecnico.map((person) => (
              <article key={person.nombre}>
                <span>
                  {String(person.nombre || '?')
                    .slice(0, 1)
                    .toUpperCase()}
                </span>
                <div>
                  <b>{person.nombre}</b>
                  <small>
                    {person.cantidad} rendición(es) · {money(person.total)}
                  </small>
                  <time>
                    {person.ultima ? new Date(person.ultima).toLocaleString('es-CL') : 'Sin fecha'}
                  </time>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {canManage && (
        <>
          <section className="ra-public-access">
            <div className="ra-public-access-icon">
              <Globe2 />
            </div>
            <div>
              <span>ACCESO PARA TÉCNICOS</span>
              <h2>Formulario público de rendiciones</h2>
              <p>Enlace único y permanente, sin inicio de sesión. Las fotos permanecen privadas.</p>
              <code>{publicUrl('/rendiciones')}</code>
            </div>
            <div className="ra-public-actions">
              <button type="button" onClick={copyTechnicianLink}>
                <Copy size={17} /> Copiar enlace
              </button>
              <a href={publicUrl('/rendiciones')} target="_blank" rel="noreferrer">
                <ExternalLink size={17} /> Abrir formulario
              </a>
            </div>
          </section>

          {false && (
            <form className="ra-panel ra-catalog-panel" onSubmit={saveCatalog}>
              <div className="ra-title">
                <Users />
                <div>
                  <h2>Catálogos del formulario</h2>
                  <p>Selecciona un registro desde las listas desplegables para editarlo.</p>
                </div>
              </div>
              <div className="ra-fields ra-catalog-fields">
                <label>
                  Tipo
                  <select
                    value={catalog.tipo}
                    onChange={(e) =>
                      setCatalog({
                        id: '',
                        tipo: e.target.value,
                        codigo: '',
                        nombre: '',
                        rut: '',
                        direccion_area: '',
                        unidad: '',
                        tecnico: '',
                        activo: true
                      })
                    }
                  >
                    <option value="centro">Centro de costo</option>
                    <option value="colaborador">Colaborador</option>
                  </select>
                </label>
                <label className="ra-record-selector">
                  Registro
                  <select value={catalog.id} onChange={(e) => selectCatalogItem(e.target.value)}>
                    <option value="">+ Agregar registro nuevo</option>
                    {(catalog.tipo === 'centro' ? data.centros : data.colaboradores).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.codigo ? `${item.codigo} · ` : ''}
                        {item.nombre}
                        {item.activo ? '' : ' (inactivo)'}
                      </option>
                    ))}
                  </select>
                </label>
                {catalog.tipo === 'centro' && (
                  <label>
                    Código
                    <input
                      maxLength="40"
                      value={catalog.codigo}
                      onChange={(e) => setCatalog({ ...catalog, codigo: e.target.value })}
                      placeholder="Ej.: 1-09"
                    />
                  </label>
                )}
                <label>
                  Nombre
                  <input
                    maxLength="120"
                    value={catalog.nombre}
                    onChange={(e) => setCatalog({ ...catalog, nombre: e.target.value })}
                    placeholder="Nombre visible"
                  />
                </label>
                {catalog.tipo === 'colaborador' && (
                  <>
                    <label>
                      RUT
                      <input
                        maxLength="15"
                        value={catalog.rut}
                        onChange={(e) => setCatalog({ ...catalog, rut: e.target.value })}
                        placeholder="12.345.678-9"
                      />
                    </label>
                    <label>
                      Dirección / área
                      <input
                        maxLength="120"
                        value={catalog.direccion_area}
                        onChange={(e) => setCatalog({ ...catalog, direccion_area: e.target.value })}
                        placeholder="Operaciones"
                      />
                    </label>
                    <label>
                      Unidad
                      <input
                        maxLength="80"
                        value={catalog.unidad}
                        onChange={(e) => setCatalog({ ...catalog, unidad: e.target.value })}
                        placeholder="PV - ST"
                      />
                    </label>
                    <label>
                      Técnico
                      <input
                        maxLength="120"
                        value={catalog.tecnico}
                        onChange={(e) => setCatalog({ ...catalog, tecnico: e.target.value })}
                        placeholder="Nombre del técnico"
                      />
                    </label>
                  </>
                )}
                <button>
                  <Plus size={17} /> {catalog.id ? 'Guardar' : 'Agregar'}
                </button>
              </div>
            </form>
          )}
        </>
      )}

      <section className="ra-panel">
        <div className="ra-toolbar">
          <div>
            <h2>Rendiciones recibidas</h2>
            <p>Abre un registro para ver comprobantes y descargar sus formatos.</p>
          </div>
          <label>
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar folio, persona o centro…"
            />
          </label>
        </div>
        <div className="ra-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Folio</th>
                <th>Fecha</th>
                <th>Responsable</th>
                <th>Realizada por</th>
                <th>Centro de costo</th>
                <th>Gastos</th>
                <th>Fotos</th>
                <th>Total</th>
                <th>Estado</th>
                {canManage && <th>Acción</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} onClick={() => openDetail(r.id)}>
                  <td>
                    <b>{r.folio}</b>
                  </td>
                  <td>{new Date(`${r.fecha_rendicion}T12:00:00`).toLocaleDateString('es-CL')}</td>
                  <td>{r.responsable_nombre}</td>
                  <td>
                    <b>{r.solicitante_tecnico_nombre || 'Sin identificar'}</b>
                  </td>
                  <td>
                    {r.centro_costo_codigo} · {r.centro_costo_nombre}
                  </td>
                  <td>{r.items}</td>
                  <td>{r.fotos}</td>
                  <td>
                    <b>{money(r.total)}</b>
                  </td>
                  <td>
                    <span className="ra-state">{r.estado}</span>
                  </td>
                  {canManage && (
                    <td>
                      <button
                        type="button"
                        className="ra-delete-report"
                        title={`Eliminar ${r.folio}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteReport(r);
                        }}
                      >
                        <Trash2 size={16} /> Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="ra-empty">No hay rendiciones para este filtro.</div>
          )}
        </div>
      </section>

      {false && canManage && (
        <details className="ra-panel ra-advanced">
          <summary>
            <Link2 />
            <div>
              <h2>Enlaces privados o temporales</h2>
              <p>Opción avanzada para campañas con fecha de vencimiento o límite de envíos.</p>
            </div>
            <span>Configurar</span>
          </summary>
          <form className="ra-advanced-form" onSubmit={createLink}>
            <div className="ra-fields">
              <label>
                Nombre del enlace
                <input
                  maxLength="120"
                  value={newLink.nombre}
                  onChange={(e) => setNewLink({ ...newLink, nombre: e.target.value })}
                  placeholder="Ej.: Rendiciones agosto"
                />
              </label>
              <label>
                Expira (opcional)
                <input
                  type="datetime-local"
                  value={newLink.expires}
                  onChange={(e) => setNewLink({ ...newLink, expires: e.target.value })}
                />
              </label>
              <label>
                Máx. envíos
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={newLink.max}
                  onChange={(e) => setNewLink({ ...newLink, max: e.target.value })}
                  placeholder="Sin límite"
                />
              </label>
              <button>
                <Plus size={17} /> Crear y copiar
              </button>
            </div>
            {createdUrl && (
              <div className="ra-created-link">
                <span>{createdUrl}</span>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(createdUrl);
                    toast.success('Enlace copiado.');
                  }}
                >
                  <Copy size={15} /> Copiar
                </button>
              </div>
            )}
          </form>
          <div className="ra-links">
            {data.links
              .filter((link) => !link.es_public_default)
              .map((link) => (
                <article key={link.id}>
                  <div>
                    <b>{link.nombre}</b>
                    <span>
                      {link.submissions_count} envíos ·{' '}
                      {link.expires_at
                        ? `expira ${new Date(link.expires_at).toLocaleString('es-CL')}`
                        : 'sin expiración'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={link.activo ? 'danger' : ''}
                    onClick={async () => {
                      try {
                        await rendicionesAdmin.toggleLink(link.id, !link.activo);
                        toast.success(link.activo ? 'Enlace desactivado.' : 'Enlace reactivado.');
                        load();
                      } catch (error) {
                        toast.error(error.message);
                      }
                    }}
                  >
                    {link.activo ? 'Desactivar' : 'Reactivar'}
                  </button>
                </article>
              ))}
            {data.links.filter((link) => !link.es_public_default).length === 0 && (
              <div className="ra-empty ra-empty-compact">No hay enlaces temporales creados.</div>
            )}
          </div>
        </details>
      )}

      {detail && (
        <div
          className="ra-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDetail(null);
          }}
        >
          <section className="ra-modal">
            <header>
              <div>
                <span>RENDICIÓN</span>
                <h2>{detail.rendicion.folio_texto}</h2>
                <p>
                  {detail.rendicion.responsable_nombre} · {money(detail.rendicion.total)}
                </p>
              </div>
              <div className="ra-modal-actions">
                <button onClick={() => downloadRendicionPDF(detail)}>
                  <Download size={16} /> PDF
                </button>
                <button onClick={() => downloadRendicionExcel(detail)}>
                  <FileSpreadsheet size={16} /> Excel
                </button>
                <button className="close" onClick={() => setDetail(null)}>
                  <X />
                </button>
              </div>
            </header>
            <div className="ra-detail-grid">
              <div>
                <b>Fecha</b>
                <span>
                  {new Date(`${detail.rendicion.fecha_rendicion}T12:00:00`).toLocaleDateString(
                    'es-CL'
                  )}
                </span>
              </div>
              <div>
                <b>Centro de costo</b>
                <span>
                  {detail.rendicion.centro_costo_codigo} · {detail.rendicion.centro_costo_nombre}
                </span>
              </div>
              <div>
                <b>Tipo de fondo</b>
                <span>
                  {detail.rendicion.tipo_fondo}
                  {detail.rendicion.fondo_por_rendir
                    ? ` · ${money(detail.rendicion.fondo_por_rendir)}`
                    : ''}
                </span>
              </div>
              <div>
                <b>Realizada por</b>
                <span>{detail.rendicion.solicitante_tecnico_nombre || 'Sin identificar'}</span>
              </div>
              <div>
                <b>RUT / área</b>
                <span>
                  {detail.rendicion.solicitante_rut || '—'} ·{' '}
                  {detail.rendicion.solicitante_direccion_area || '—'}
                </span>
              </div>
              <div>
                <b>Estado</b>
                <span>{detail.rendicion.estado}</span>
              </div>
            </div>
            <div className="ra-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nº</th>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>Categoría</th>
                    <th>Documento</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.orden}</td>
                      <td>{new Date(`${item.fecha}T12:00:00`).toLocaleDateString('es-CL')}</td>
                      <td>{item.descripcion}</td>
                      <td>
                        {item.categoria_nombre}
                        <small>{item.subcategoria_nombre}</small>
                      </td>
                      <td>
                        {item.tipo_documento}
                        <small>{item.numero_documento}</small>
                      </td>
                      <td>{money(item.monto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {detail.fotos.length > 0 && (
              <div className="ra-gallery">
                {detail.fotos.map((photo) => (
                  <a href={photo.url} target="_blank" rel="noreferrer" key={photo.id}>
                    <img src={photo.url} alt="Comprobante" />
                    <span>
                      <ExternalLink size={15} /> Abrir
                    </span>
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
