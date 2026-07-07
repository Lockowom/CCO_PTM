import { create } from 'zustand';
import { supabase } from '../supabase';
import { RACK_CONFIG, TOTAL_POSITIONS, getPositionsForLevel } from '../constants/warehouse';

export const useWarehouseStore = create((set, get) => ({
  layout: {},
  inventory: {},
  stats: { total: 0, ocupadas: 0, vacias: 0, ocupacion: 0 },
  loading: false,
  loaded: false,        // datos ya cargados al menos una vez (caché)
  lastLoadedAt: 0,
  _inflight: null,      // promesa de carga en curso (dedupe de concurrencia)
  ui: {
    activeCell: null,
    searchQuery: '',
    heatmapMode: false,
    camera: { x: -1500, y: -1500, zoom: 0.1 }
  },

  setSearchQuery: (query) => set((state) => ({ ui: { ...state.ui, searchQuery: query } })),
  setActiveCell: (cellId) => set((state) => ({ ui: { ...state.ui, activeCell: cellId } })),
  toggleHeatmap: () => set((state) => ({ ui: { ...state.ui, heatmapMode: !state.ui.heatmapMode } })),
  setCamera: (camera) => set((state) => ({ ui: { ...state.ui, camera: { ...state.ui.camera, ...camera } } })),

  // force=false → usa caché si ya se cargó (no recarga al navegar).
  // force=true  → recarga (botón refrescar / tras ediciones).
  fetchWarehouseData: async (force = false) => {
    // Dedupe: si ya hay una carga en curso, reutilizarla
    const inflight = get()._inflight;
    if (inflight) return inflight;
    // Caché con TTL: si hay datos frescos (<2 min) y no se fuerza, no recargar
    const CACHE_TTL = 2 * 60 * 1000;
    if (!force && get().loaded && Object.keys(get().inventory).length > 0
        && (Date.now() - get().lastLoadedAt) < CACHE_TTL) return;

    const run = (async () => {
    set({ loading: true });
    // Timeout de seguridad: aborta si la red se cuelga (evita "cargando eterno")
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const normalizeLoc = (loc) => {
        if (!loc) return '';
        // 1. Limpieza agresiva: eliminar todo lo que no sea letras, números o guiones/espacios
        let cleaned = loc.trim().toUpperCase().replace(/[\s\.]+/g, '-');
        
        // 2. Normalización de partes: RACK-POSICION-NIVEL
        const parts = cleaned.split('-').filter(p => p !== '');
        if (parts.length >= 2) {
          const rack = parts[0];
          let p1 = parts[1];
          let p2 = parts[2] || '01';

          const val1 = parseInt(p1);
          const val2 = parseInt(p2);

          // Heurística: si p1 parece nivel (<=4) y p2 parece posición (>4), invertir a POSICION-NIVEL
          if (!isNaN(val1) && !isNaN(val2) && val1 <= 4 && val2 > 4) {
            [p1, p2] = [p2, p1];
          }

          const normPos = isNaN(parseInt(p1)) ? p1 : parseInt(p1).toString().padStart(2, '0');
          const normLevel = isNaN(parseInt(p2)) ? p2 : parseInt(p2).toString().padStart(2, '0');

          return `${rack}-${normPos}-${normLevel}`;
        }
        return cleaned;
      };

      // Trae TODOS los registros en PARALELO (1 round-trip de count + N páginas a la vez).
      // Mucho más rápido que paginar secuencialmente y resistente a una página lenta.
      const fetchAllParallel = async (tableName, columns, orderCol) => {
        const step = 1000;
        const { count, error: countErr } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
          .abortSignal(controller.signal);
        if (countErr) throw countErr;
        const total = count || 0;
        if (total === 0) return [];

        const pages = Math.ceil(total / step);
        const requests = [];
        for (let i = 0; i < pages; i++) {
          const from = i * step;
          requests.push(
            supabase
              .from(tableName)
              .select(columns)
              .order(orderCol, { ascending: true })
              .range(from, from + step - 1)
              .abortSignal(controller.signal)
              .then(({ data, error }) => { if (error) throw error; return data || []; })
          );
        }
        const chunks = await Promise.all(requests);
        return chunks.flat();
      };

      // 1. Inventario real (fuente de verdad de ocupación) — solo columnas necesarias
      // 2. Layout físico (metadata) — en paralelo con el inventario
      const [ubicacionesRows, layoutRows] = await Promise.all([
        fetchAllParallel('wms_ubicaciones', 'id,ubicacion,codigo,descripcion,cantidad', 'id'),
        fetchAllParallel('wms_layout', '*', 'ubicacion').catch(() => [])
      ]);

      const inventoryMap = {};
      const layoutMap = {};
      const validOccupiedLocations = new Set();
      
      // Procesar Inventario: Capturar TODO el stock disponible
      (ubicacionesRows || []).forEach(row => {
        if (!row.ubicacion) return;
        
        const normUbic = normalizeLoc(row.ubicacion);
        if (!inventoryMap[normUbic]) inventoryMap[normUbic] = [];
        
        inventoryMap[normUbic].push({
          ...row,
          ubicacion: normUbic
        });

        // Validar si la ubicación es físicamente posible (formato: RACK-POS-NIVEL)
        const parts = normUbic.split('-');
        const rackId = parts[0];
        const pos = parseInt(parts[1]);
        const level = parseInt(parts[2]);
        const config = RACK_CONFIG[rackId];

        const maxPos = config ? getPositionsForLevel(rackId, level) : 0;
        const isValid = config && level <= config.levels && pos <= maxPos;

        if (Number(row.cantidad) > 0 && isValid) {
          validOccupiedLocations.add(normUbic);
        }
      });

      // Procesar Layout y MERGE con Inventario
      (layoutRows || []).forEach(row => {
        const normUbic = normalizeLoc(row.ubicacion);
        layoutMap[normUbic] = {
          ...row,
          ubicacion: normUbic,
          cantidad: (inventoryMap[normUbic] || []).reduce((acc, curr) => acc + (Number(curr.cantidad) || 0), 0)
        };

        const parts = normUbic.split('-');
        const rackId = parts[0];
        const pos = parseInt(parts[1]);
        const level = parseInt(parts[2]);
        const config = RACK_CONFIG[rackId];
        const maxPos = config ? getPositionsForLevel(rackId, level) : 0;
        const isValid = config && level <= config.levels && pos <= maxPos;

        if (row.estado === 'OCUPADA' && isValid) {
          validOccupiedLocations.add(normUbic);
        }
      });

      // AÑADIR ubicaciones que están en inventario pero NO en layout (Crucial para el "AUN NO")
      Object.keys(inventoryMap).forEach(normUbic => {
        if (!layoutMap[normUbic]) {
          const parts = normUbic.split('-');
          layoutMap[normUbic] = {
            ubicacion: normUbic,
            pasillo: parts[0],
            columna: parseInt(parts[1]) || 0,
            nivel: parseInt(parts[2]) || 0,
            estado: 'OCUPADA', // Si está en inventario con stock, está ocupada
            cantidad: inventoryMap[normUbic].reduce((acc, curr) => acc + (Number(curr.cantidad) || 0), 0)
          };
        }
      });

      const occupiedCount = validOccupiedLocations.size;

      set({
        layout: layoutMap,
        inventory: inventoryMap,
        stats: {
          total: TOTAL_POSITIONS,
          ocupadas: occupiedCount,
          vacias: Math.max(0, TOTAL_POSITIONS - occupiedCount),
          ocupacion: TOTAL_POSITIONS > 0 ? Math.round((occupiedCount / TOTAL_POSITIONS) * 100) : 0
        },
        loading: false,
        loaded: true,
        lastLoadedAt: Date.now()
      });

    } catch (_) {
      if (_?.name === 'AbortError') {
        console.error('Warehouse data fetch: timeout/abort (red lenta)');
      } else {
        console.error('Warehouse data fetch error:', _);
      }
      set({ loading: false });
    } finally {
      clearTimeout(timeoutId);
    }
    })();

    set({ _inflight: run });
    try {
      await run;
    } finally {
      set({ _inflight: null });
    }
  },

  updateLocationState: async (ubicacion, nuevoEstado) => {
    if (!ubicacion || typeof ubicacion !== 'string') return;
    try {
      const parsed = ubicacion.split('-');
      const payload = {
        ubicacion: ubicacion,
        estado: nuevoEstado,
        pasillo: parsed[0],
        columna: parseInt(parsed[1]) || 0,
        nivel: parseInt(parsed[2]) || 0,
        updated_at: new Date()
      };

      const { error } = await supabase
        .from('wms_layout')
        .upsert(payload, { onConflict: 'ubicacion' });

      if (error) throw error;
      
      // Update local state instantly
      set((state) => {
        const newLayout = { ...state.layout };
        if (newLayout[ubicacion]) {
          newLayout[ubicacion].estado = nuevoEstado;
        } else {
           newLayout[ubicacion] = {
             id: ubicacion,
             pasillo: payload.pasillo,
             columna: payload.columna,
             nivel: payload.nivel,
             estado: nuevoEstado,
             cantidad: 0
           };
        }
        return { layout: newLayout };
      });

    } catch (error) {
      throw error;
    }
  },

  subscribeToRealtime: () => {
    let debounceTimer = null;
    const debouncedFetch = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => get().fetchWarehouseData(), 2000);
    };

    const channel = supabase
      .channel('warehouse-dna-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wms_ubicaciones' }, debouncedFetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wms_layout' }, debouncedFetch)
      .subscribe((status, err) => {
        if (err) console.error('Realtime subscription error:', err);
      });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }
}));