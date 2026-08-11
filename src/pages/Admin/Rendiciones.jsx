import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Camera,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Link2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  WalletCards,
  X
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
    activo: true
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await rendicionesAdmin.dashboard(300));
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
      await rendicionesAdmin.guardarCatalogo(catalog.tipo, {
        id: catalog.id || null,
        codigo: cleanHumanText(catalog.codigo),
        nombre: cleanHumanText(catalog.nombre),
        activo: catalog.activo
      });
      toast.success('Catálogo actualizado.');
      setCatalog({ id: '', tipo: catalog.tipo, codigo: '', nombre: '', activo: true });
      load();
    } catch (error) {
      toast.error(error.message);
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

      {canManage && (
        <section className="ra-admin-grid">
          <form className="ra-panel" onSubmit={createLink}>
            <div className="ra-title">
              <Link2 />
              <div>
                <h2>Crear enlace público</h2>
                <p>El secreto se entrega y copia una sola vez.</p>
              </div>
            </div>
            <div className="ra-fields">
              <label>
                Nombre
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
          <form className="ra-panel" onSubmit={saveCatalog}>
            <div className="ra-title">
              <Users />
              <div>
                <h2>Catálogos del formulario</h2>
                <p>Selecciona un registro para editar su nombre oficial.</p>
              </div>
            </div>
            <div className="ra-fields">
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
                      activo: true
                    })
                  }
                >
                  <option value="centro">Centro de costo</option>
                  <option value="colaborador">Colaborador</option>
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
              <button>
                <Plus size={17} /> {catalog.id ? 'Guardar' : 'Agregar'}
              </button>
            </div>
            <div className="ra-catalog-list">
              {(catalog.tipo === 'centro' ? data.centros : data.colaboradores).map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() =>
                    setCatalog({
                      id: item.id,
                      tipo: catalog.tipo,
                      codigo: item.codigo || '',
                      nombre: item.nombre,
                      activo: item.activo
                    })
                  }
                >
                  {item.codigo ? `${item.codigo} · ` : ''}
                  {item.nombre}
                </button>
              ))}
            </div>
          </form>
        </section>
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
                <th>Centro de costo</th>
                <th>Gastos</th>
                <th>Fotos</th>
                <th>Total</th>
                <th>Estado</th>
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
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="ra-empty">No hay rendiciones para este filtro.</div>
          )}
        </div>
      </section>

      {canManage && (
        <section className="ra-panel">
          <div className="ra-title">
            <Link2 />
            <div>
              <h2>Enlaces emitidos</h2>
              <p>Por seguridad, un enlace no puede volver a revelar su token después de crearlo.</p>
            </div>
          </div>
          <div className="ra-links">
            {data.links.map((link) => (
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
                  className={link.activo ? 'danger' : ''}
                  onClick={async () => {
                    await rendicionesAdmin.toggleLink(link.id, !link.activo);
                    toast.success(link.activo ? 'Enlace desactivado.' : 'Enlace reactivado.');
                    load();
                  }}
                >
                  {link.activo ? 'Desactivar' : 'Reactivar'}
                </button>
              </article>
            ))}
          </div>
        </section>
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
                <span>{detail.rendicion.tipo_fondo}</span>
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
