import { describe, expect, it, vi } from 'vitest';
import { resolveModuleUiRuntime } from '../components/shell/moduleUiRuntime';

describe('CCO 2.0 core module runtime', () => {
  it.each([
    ['/panel', 'dashboard', 'web_dashboard_v2'],
    ['/panel/ingresar', 'panel-nv', 'web_panel_nv_v2'],
    ['/panel/info', 'panel-nv', 'web_panel_nv_v2'],
    ['/inventory/conteo', 'inventory', 'web_inventory_v2'],
    ['/queries/locations', 'inventory', 'web_inventory_v2'],
    ['/inbound/reception', 'inbound', 'web_inbound_v2'],
    ['/quality/monitoring', 'quality', 'web_quality_v2'],
    ['/postventa', 'postventa', 'web_postventa_v2'],
    ['/postventa/tickets', 'postventa', 'web_postventa_v2'],
    ['/panel/rutas', 'routes', 'web_routes_v2'],
    ['/tms/control', 'tms', 'web_tms_v2'],
    ['/tms/pda', 'tms-mobile', 'mobile_tms_v2']
  ])('mapea %s a %s', (path, id, flag) => {
    const enabled = vi.fn(() => true);
    const runtime = resolveModuleUiRuntime(path, enabled);
    expect(runtime).toMatchObject({ id, flag, enabled: true });
    expect(enabled).toHaveBeenCalledWith(flag);
  });

  it('mantiene rutas fuera del bloque en legacy', () => {
    expect(resolveModuleUiRuntime('/admin/users', () => true)).toMatchObject({
      id: 'legacy',
      enabled: false
    });
  });

  it('resuelve los flags móviles y de mapa sin convertirlos en permisos', () => {
    const runtime = resolveModuleUiRuntime('/panel/rutas', (flag) => flag === 'mobile_map_v2');
    expect(runtime.enabled).toBe(false);
    expect(runtime.mobileEnabled).toBe(false);
    expect(runtime.mapEnabled).toBe(true);
  });
});
