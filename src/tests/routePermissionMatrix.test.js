import { describe, expect, it } from 'vitest';
import { ROUTE_PERMISSIONS, TAB_PERMISSIONS } from '../constants/permissions';
import { APP_ROUTES } from '../config/modules';
import { ALL_PERMISSION_IDS, ROLE_BLUEPRINTS } from '../config/iamBlueprints';
import { puedeAccederRuta } from '../constants/permissions';

// ── PR-001 · Matriz de regresión ruta × permiso × rol ────────────────────────
// Contrato: toda ruta del catálogo de pantallas debe estar declarada en
// ROUTE_PERMISSIONS (si no, el guard DENIEGA por defecto). Y todo permiso
// referenciado en rutas / pestañas / blueprints debe existir en el catálogo
// APP_PERMISSIONS. Cualquier ruta o permiso nuevo rompe este test a propósito.

const toBasePath = (value) => String(value || '').split('?')[0].replace(/\/+$/, '');

describe('PR-001 · integridad del mapa de rutas', () => {
  it('declara permiso para toda ruta del catálogo APP_ROUTES (fail-closed)', () => {
    const sinDeclarar = APP_ROUTES.map((r) => toBasePath(r.value)).filter(
      (base) => !Object.prototype.hasOwnProperty.call(ROUTE_PERMISSIONS, base)
    );
    expect(sinDeclarar).toEqual([]);
  });

  it('no tiene rutas huérfanas en ROUTE_PERMISSIONS sin respaldo en el catálogo', () => {
    const catalogadas = new Set(APP_ROUTES.map((r) => toBasePath(r.value)));
    catalogadas.add('/'); // índice del router
    catalogadas.add('/inventory/bloque/:codigo'); // destino del QR, no listado en pantallas
    catalogadas.add('/panel/rutas'); // piloto privado (gate por UID), sin landing pública
    catalogadas.add('/seguridad'); // pantalla de MFA propia, sin landing pública
    const huerfanas = Object.keys(ROUTE_PERMISSIONS).filter((k) => !catalogadas.has(k));
    expect(huerfanas).toEqual([]);
  });

  it('referencia solo permisos que existen en APP_PERMISSIONS', () => {
    const catalog = new Set(ALL_PERMISSION_IDS);
    const referenciados = new Set();
    Object.values(ROUTE_PERMISSIONS).forEach((p) =>
      (Array.isArray(p) ? p : []).forEach((perm) => referenciados.add(perm))
    );
    Object.values(TAB_PERMISSIONS).forEach((cfg) => {
      Object.entries(cfg).forEach(([k, v]) => {
        if (k === '_amplios') (Array.isArray(v) ? v : []).forEach((p) => referenciados.add(p));
        else if (k !== '_default' && typeof v === 'string') referenciados.add(v);
      });
    });
    const invalidos = [...referenciados].filter((perm) => !catalog.has(perm));
    expect(invalidos).toEqual([]);
  });
});

describe('PR-001 · matriz ruta × rol (regresión de accesos)', () => {
  const acceso = (blueprint, path) => {
    const perms = new Set(blueprint.permissions);
    const hasPermission = (p) => perms.has(p);
    const user = { rol: blueprint.id, es_admin_delegado: false };
    return puedeAccederRuta(path, user, hasPermission);
  };

  const rutasCriticas = [
    '/panel',
    '/panel/ingresar',
    '/panel/info',
    '/panel/configuracion',
    '/admin/users',
    '/admin/roles',
    '/inventory/traspasos',
    '/inventory/conteo',
    '/inventory/analisis',
    '/quality/monitoreo',
    '/postventa/tickets',
    '/inbound/reception',
    '/queries/batches',
    '/mobile/pda'
  ];

  // Matriz esperada (rol → rutas que DEBE poder ver). Si un rol gana acceso a
  // una ruta que no debería tener, este snapshot falla.
  const accesoEsperado = {
    ADMIN: rutasCriticas, // bypass total
    GERENCIA: ['/panel', '/panel/ingresar', '/panel/info', '/quality/monitoreo', '/postventa/tickets'],
    INVENTARIO_: ['/inventory/traspasos', '/inventory/conteo', '/inventory/analisis', '/inbound/reception', '/mobile/pda', '/queries/batches'],
    OPERADOR: ['/inventory/traspasos', '/inventory/conteo', '/mobile/pda'],
    SUPERVISOR: ['/panel', '/panel/ingresar', '/panel/info'],
    CONTROL_CALIDAD: ['/quality/monitoreo', '/inbound/reception'],
    OPERARIO_3: ['/inventory/traspasos']
  };

  it('mantiene el acceso mínimo de cada rol (sin regresiones)', () => {
    for (const [rol, permitidas] of Object.entries(accesoEsperado)) {
      const bp = ROLE_BLUEPRINTS.find((b) => b.id === rol);
      expect(bp, `blueprint ${rol} existe`).toBeDefined();
      permitidas.forEach((ruta) => {
        expect(acceso(bp, ruta), `[${rol}] debería poder ver ${ruta}`).toBe(true);
      });
    }
  });

  it('bloquea rutas fuera del alcance de cada rol (sin fugas)', () => {
    const prohibidas = {
      OPERADOR: ['/admin/users', '/admin/roles', '/panel/configuracion'],
      INVENTARIO_: ['/admin/users', '/panel/configuracion'],
      // view_batches (que tiene CONTROL_CALIDAD) da acceso aditivo a Análisis.
      CONTROL_CALIDAD: ['/admin/users', '/panel/configuracion'],
      GERENCIA: ['/admin/users', '/panel/configuracion']
    };
    for (const [rol, rutas] of Object.entries(prohibidas)) {
      const bp = ROLE_BLUEPRINTS.find((b) => b.id === rol);
      rutas.forEach((ruta) => {
        expect(acceso(bp, ruta), `[${rol}] NO debería ver ${ruta}`).toBe(false);
      });
    }
  });

  it('excluye rutas con parámetro (QR) de la lista de pantallas del catálogo', () => {
    const params = APP_ROUTES.map((r) => toBasePath(r.value)).filter((v) => v.includes(':'));
    expect(params).toEqual([]);
  });
});