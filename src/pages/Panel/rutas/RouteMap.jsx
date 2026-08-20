import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { pointForStop, SECTOR_COLORS, SECTOR_COMMUNES, SECTOR_POLYGONS } from './routeCoordination';

const text = (value) => String(value || '—');

function popupFor(item, point) {
  const root = document.createElement('div');
  root.className = 'cr-popup';
  const title = document.createElement('strong');
  title.textContent = item.nv ? `N.V. ${item.nv}` : item.tipo === 'RETIRO' ? 'Retiro' : 'Despacho';
  const client = document.createElement('span');
  client.textContent = text(item.cliente);
  const address = document.createElement('small');
  address.textContent = `${text(item.direccion)} · ${text(item.comuna)}`;
  root.append(title, client, address);
  if (point.approximate) {
    const warning = document.createElement('em');
    warning.textContent = 'Ubicación aproximada por comuna';
    root.append(warning);
  }
  return root;
}

export default function RouteMap({ items = [], selectedPlan = null, sector = 'Todos' }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(null);
  const routeRef = useRef(null);
  const [mapState, setMapState] = useState('loading');
  const [mapError, setMapError] = useState('');
  const selectedKeys = useMemo(
    () =>
      new Set(
        (selectedPlan?.paradas || []).map(
          (item) => `${item.tipo || 'NV'}:${item.operacion_id || item.id}`
        )
      ),
    [selectedPlan]
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;
    let map;
    try {
      map = L.map(containerRef.current, { zoomControl: true }).setView([-33.4727, -70.66], 10);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      })
        .on('load', () => setMapState('ready'))
        .on('tileerror', () => {
          setMapState('error');
          setMapError('No fue posible cargar la cartografía. Revisa la conexión.');
        })
        .addTo(map);
      Object.entries(SECTOR_POLYGONS).forEach(([name, polygon]) => {
        L.polygon(polygon, {
          color: SECTOR_COLORS[name],
          fillColor: SECTOR_COLORS[name],
          fillOpacity: 0.06,
          weight: 1.5,
          dashArray: '5 5'
        })
          .bindTooltip(`${name} · ${SECTOR_COMMUNES[name].join(', ')}`, { sticky: true })
          .addTo(map);
      });
      markersRef.current = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 46,
        disableClusteringAtZoom: 15
      }).addTo(map);
      mapRef.current = map;
      setMapState('ready');
      const resize = new ResizeObserver(() => map.invalidateSize({ pan: false }));
      resize.observe(containerRef.current);
      return () => {
        resize.disconnect();
        map.remove();
        mapRef.current = null;
      };
    } catch (error) {
      setMapState('error');
      setMapError(error?.message || 'No fue posible iniciar el mapa.');
      return undefined;
    }
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = markersRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    if (routeRef.current) {
      routeRef.current.remove();
      routeRef.current = null;
    }
    const visible = items.filter(
      (item) => sector === 'Todos' || item.sector === sector || selectedPlan?.id === item.plan_id
    );
    const points = [];
    let missingCoordinates = 0;
    visible.forEach((item) => {
      const point = pointForStop(item);
      if (!point) {
        missingCoordinates += 1;
        return;
      }
      points.push([point.lat, point.lng]);
      const color = SECTOR_COLORS[item.sector] || SECTOR_COLORS['Fuera de Santiago'];
      const selected = selectedKeys.has(`${item.tipo || 'NV'}:${item.operacion_id || item.id}`);
      L.circleMarker([point.lat, point.lng], {
        radius: selected ? 12 : item.urgente || item.prioridad ? 10 : 7,
        color: selected ? '#111827' : item.urgente || item.prioridad ? '#dc2626' : '#ffffff',
        weight: selected || item.urgente || item.prioridad ? 3 : 2,
        fillColor: color,
        fillOpacity: 0.9
      })
        .bindPopup(popupFor(item, point))
        .addTo(layer);
    });
    const routePoints = (selectedPlan?.paradas || []).map(pointForStop).filter(Boolean);
    if (routePoints.length > 1) {
      routeRef.current = L.polyline(
        routePoints.map((point) => [point.lat, point.lng]),
        { color: '#0f172a', weight: 4, opacity: 0.8, dashArray: '10 7' }
      ).addTo(map);
    }
    const bounds = [...points, ...routePoints.map((point) => [point.lat, point.lng])];
    if (bounds.length) map.fitBounds(bounds, { padding: [35, 35], maxZoom: 13 });
    map.getContainer().dataset.missingCoordinates = String(missingCoordinates);
  }, [items, sector, selectedPlan, selectedKeys]);

  const visibleCount = items.filter(
    (item) => sector === 'Todos' || item.sector === sector || selectedPlan?.id === item.plan_id
  ).length;
  const unmappedCount = items
    .filter(
      (item) => sector === 'Todos' || item.sector === sector || selectedPlan?.id === item.plan_id
    )
    .filter((item) => !pointForStop(item)).length;
  const noRoute = selectedPlan && (selectedPlan.paradas || []).length < 2;

  return (
    <div className="cr-map-frame">
      <div ref={containerRef} className="cr-map" aria-label="Mapa de rutas de Santiago" />
      {mapState === 'loading' && (
        <div className="cr-map-state" role="status">
          Cargando mapa…
        </div>
      )}
      {mapState === 'error' && (
        <div className="cr-map-state cr-map-state--error" role="alert">
          {mapError}
        </div>
      )}
      {mapState === 'ready' && visibleCount === 0 && (
        <div className="cr-map-state cr-map-state--empty">No hay paradas para este filtro.</div>
      )}
      {mapState === 'ready' && noRoute && (
        <div className="cr-map-status" role="status">
          Ruta sin trazado: agrega al menos dos paradas.
        </div>
      )}
      {mapState === 'ready' && unmappedCount > 0 && (
        <div className="cr-map-status cr-map-status--coordinates" role="status">
          {unmappedCount}{' '}
          {unmappedCount === 1 ? 'parada sin coordenadas' : 'paradas sin coordenadas'}
        </div>
      )}
    </div>
  );
}
