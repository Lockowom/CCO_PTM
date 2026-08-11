import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;
    const map = L.map(containerRef.current, { zoomControl: true }).setView([-33.4727, -70.66], 10);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map);
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
    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    const resize = new ResizeObserver(() => map.invalidateSize());
    resize.observe(containerRef.current);
    return () => {
      resize.disconnect();
      map.remove();
      mapRef.current = null;
    };
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
    visible.forEach((item) => {
      const point = pointForStop(item);
      if (!point) return;
      points.push([point.lat, point.lng]);
      const color = SECTOR_COLORS[item.sector] || SECTOR_COLORS['Fuera de Santiago'];
      L.circleMarker([point.lat, point.lng], {
        radius: item.urgente || item.prioridad ? 10 : 7,
        color: item.urgente || item.prioridad ? '#dc2626' : '#ffffff',
        weight: item.urgente || item.prioridad ? 3 : 2,
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
  }, [items, sector, selectedPlan]);

  return <div ref={containerRef} className="cr-map" aria-label="Mapa de rutas de Santiago" />;
}
