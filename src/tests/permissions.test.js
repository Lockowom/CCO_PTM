import { describe, expect, it } from 'vitest';
import { accesosConPermisos, puedeAccederRuta } from '../constants/permissions';

const user = { rol: 'CEO_PTM', es_admin_delegado: false };
const onlyPanelInfo = (permission) => permission === 'panel_info';

describe('autorización por ruta', () => {
  it('permite Info N.V. y rechaza Dashboard y Lotes/Series con solo panel_info', () => {
    expect(puedeAccederRuta('/panel/info', user, onlyPanelInfo)).toBe(true);
    expect(puedeAccederRuta('/panel', user, onlyPanelInfo)).toBe(false);
    expect(puedeAccederRuta('/queries/batches', user, onlyPanelInfo)).toBe(false);
  });

  it('valida también destinos con query string', () => {
    expect(puedeAccederRuta('/panel/info?nv=12345', user, onlyPanelInfo)).toBe(true);
  });
});

describe('resumen visual de accesos', () => {
  it('muestra Panel PTM con una única pantalla, sin atribuir el Dashboard', () => {
    const { modulos } = accesosConPermisos(['panel_info']);
    expect(modulos).toHaveLength(1);
    expect(modulos[0].label).toBe('Panel PTM');
    expect(modulos[0].rutas.map((route) => route.value)).toEqual(['/panel/info']);
  });
});
