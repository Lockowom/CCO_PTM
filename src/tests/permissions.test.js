import { describe, expect, it } from 'vitest';
import {
  accesosConPermisos,
  puedeAccederRuta,
  resolverRutaInicial
} from '../constants/permissions';

const user = { rol: 'CEO_PTM', es_admin_delegado: false };
const onlyPanelInfo = (permission) => permission === 'panel_info';
const arielPermissions = new Set(['view_panel', 'panel_info', 'panel_tv', 'process_reception']);
const hasArielPermission = (permission) => arielPermissions.has(permission);

describe('autorización por ruta', () => {
  it('permite Info N.V. y rechaza Dashboard y Lotes/Series con solo panel_info', () => {
    expect(puedeAccederRuta('/panel/info', user, onlyPanelInfo)).toBe(true);
    expect(puedeAccederRuta('/panel', user, onlyPanelInfo)).toBe(false);
    expect(puedeAccederRuta('/queries/batches', user, onlyPanelInfo)).toBe(false);
  });

  it('valida también destinos con query string', () => {
    expect(puedeAccederRuta('/panel/info?nv=12345', user, onlyPanelInfo)).toBe(true);
  });

  it('no convierte view_panel en acceso implícito a todas las pantallas', () => {
    expect(puedeAccederRuta('/panel', user, hasArielPermission)).toBe(true);
    expect(puedeAccederRuta('/panel/info', user, hasArielPermission)).toBe(true);
    expect(puedeAccederRuta('/panel/tv', user, hasArielPermission)).toBe(true);
    expect(puedeAccederRuta('/panel/ingresar', user, hasArielPermission)).toBe(false);
    expect(puedeAccederRuta('/panel/builder', user, hasArielPermission)).toBe(false);
  });

  it('mantiene manage_panel como permiso operativo completo', () => {
    const managePanel = (permission) => permission === 'manage_panel';
    expect(puedeAccederRuta('/panel', user, managePanel)).toBe(true);
    expect(puedeAccederRuta('/panel/ingresar', user, managePanel)).toBe(true);
    expect(puedeAccederRuta('/panel/info', user, managePanel)).toBe(true);
    expect(puedeAccederRuta('/panel/tv', user, managePanel)).toBe(true);
    expect(puedeAccederRuta('/panel/builder', user, managePanel)).toBe(true);
  });
});

describe('resumen visual de accesos', () => {
  it('muestra Panel PTM con una única pantalla, sin atribuir el Dashboard', () => {
    const { modulos } = accesosConPermisos(['panel_info']);
    expect(modulos).toHaveLength(1);
    expect(modulos[0].label).toBe('Panel PTM');
    expect(modulos[0].rutas.map((route) => route.value)).toEqual(['/panel/info']);
  });

  it('muestra exactamente las pantallas asignadas al rol CEO_PTM', () => {
    const { modulos } = accesosConPermisos([...arielPermissions]);
    const panel = modulos.find((module) => module.label === 'Panel PTM');
    expect(panel.rutas.map((route) => route.value)).toEqual(['/panel', '/panel/info', '/panel/tv']);
  });
});

describe('página inicial de roles dinámicos', () => {
  it('resuelve la primera pantalla de cualquier módulo', () => {
    expect(resolverRutaInicial(['panel_info'])).toBe('/panel/info');
    expect(resolverRutaInicial(['view_postventa'])).toBe('/postventa/tickets');
    expect(resolverRutaInicial(['manage_quality'])).toBe('/quality/monitoreo');
    expect(resolverRutaInicial([])).toBeNull();
  });

  it('descarta una landing incompatible y conserva una autorizada', () => {
    expect(resolverRutaInicial(['panel_info'], '/queries/batches')).toBe('/panel/info');
    expect(resolverRutaInicial(['panel_info'], '/panel/info')).toBe('/panel/info');
  });
});
