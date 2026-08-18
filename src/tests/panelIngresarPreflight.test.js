import { describe, expect, it } from 'vitest';
import { ESTADOS } from '../pages/Panel/ingresar/estados';
import {
  normNV,
  normText,
  normNumber,
  soloFecha,
  normEstadoInput,
  sanitizePayload,
  resumenPayload,
  tieneCamposInventario,
  diffNvConflict
} from '../pages/Panel/ingresar/dataQuality';
import {
  preflightGuardar,
  primerProblema,
  requiereEstado,
  pausaShippingRequiereMotivo,
  pausaShippingBloqueaAvance,
  requiereAccesoIAM,
  entregadaBloquea,
  requiereAsociacionOrange,
  calidadDatos
} from '../pages/Panel/ingresar/preflight';
import {
  versionDeRow,
  versionDePayload,
  versionEsActual,
  esConflicto,
  esVersionRequerida,
  resultadoConflicto,
  VERSION_FIELD
} from '../pages/Panel/ingresar/optimisticVersion';
import { ERROR_CODES } from '../core/domain/appError';

describe('PR-016 · data quality (normalización de payload N.V.)', () => {
  it('normaliza N.V. con sufijo .0 (así la deja el trigger/Sheets)', () => {
    expect(normNV('001234.0')).toBe('001234');
    expect(normNV('123.0000')).toBe('123');
    expect(normNV(' OR-789 ')).toBe('OR-789');
    expect(normNV('')).toBe('');
    expect(normNV(null)).toBe('');
  });

  it('normNV conserva identificadores con ceros a la izquierda sin sufijo .0', () => {
    expect(normNV('001234')).toBe('001234');
    expect(normNV('001234.0')).toBe('001234');
    expect(normNV('000001')).toBe('000001');
  });

  it('normNV no corrompe identificadores alfanuméricos ni valores nulos', () => {
    expect(normNV('OR-001234')).toBe('OR-001234');
    expect(normNV('FARMAPACK-7')).toBe('FARMAPACK-7');
    expect(normNV('12A34')).toBe('12A34');
    expect(normNV(undefined)).toBe('');
    expect(normNV('   ')).toBe('');
  });

  it('normNumber NO se usa para identificadores (guia/factura/NV son texto)', () => {
    // normNumber destruiría "001234"; los identificadores usan normText/normNV.
    expect(normText('001234')).toBe('001234');
    expect(normNV('001234')).toBe('001234');
    // normNumber solo aplica a CANTIDADES (bultos, valorFactura).
    expect(normNumber('001234')).toBe(1234);
  });

  it('colapsa y recorta texto genérico', () => {
    expect(normText('  Hola   mundo  ')).toBe('Hola mundo');
    expect(normText(null)).toBe('');
  });

  it('parsea números con separadores chilenos y rechaza basura', () => {
    expect(normNumber('1.234,5')).toBe(1234.5);
    expect(normNumber('12')).toBe(12);
    expect(normNumber('')).toBe(null);
    expect(normNumber('abc')).toBe(null);
    expect(normNumber(NaN)).toBe(null);
  });

  it('recorta timestamps a YYYY-MM-DD para inputs date', () => {
    expect(soloFecha('2026-08-17T14:00:00.000Z')).toBe('2026-08-17');
    expect(soloFecha(null)).toBe('');
  });

  it('normEstadoInput deja un estado inválido/vacío en el primero del flujo', () => {
    expect(normEstadoInput('')).toBe(ESTADOS.EN_PROCESO);
    expect(normEstadoInput(undefined)).toBe(ESTADOS.EN_PROCESO);
    expect(normEstadoInput(ESTADOS.EN_RUTA)).toBe(ESTADOS.EN_RUTA);
  });

  it('sanitizePayload limpia fechas, números y textos sin mutar el input', () => {
    const raw = {
      nv: ' 123.0 ',
      estado: '',
      cliente: '  Cliente  PTM ',
      bultos: '1.234,5',
      valorFactura: '999',
      urgente: 'true',
      fechaCompromiso: '2026-08-17T12:00:00Z'
    };
    const out = sanitizePayload(raw);
    expect(raw.cliente).toBe('  Cliente  PTM '); // no muta
    expect(out.nv).toBe('123');
    expect(out.estado).toBe(ESTADOS.EN_PROCESO);
    expect(out.cliente).toBe('Cliente PTM');
    expect(out.bultos).toBe(1234.5);
    expect(out.valorFactura).toBe(999);
    expect(out.urgente).toBe(true);
    expect(out.fechaCompromiso).toBe('2026-08-17');
  });

  it('resumenPayload extrae solo lo relevante (sin datos sensibles)', () => {
    const r = resumenPayload({
      id: 1,
      mode: 'update',
      canal: 'ptm',
      nv: ' 42.0 ',
      estado: 'En Ruta',
      urgente: true,
      transportista: 'CORREOS',
      version: '2026-08-17',
      password: 'secreto' // no debe pasar
    });
    expect(r).toEqual({
      id: 1,
      mode: 'update',
      canal: 'ptm',
      nv: '42',
      estado: 'En Ruta',
      urgente: true,
      transportista: 'CORREOS',
      version: '2026-08-17'
    });
    expect(r.password).toBeUndefined();
  });

  it('detecta campos de inventario para cumplir "no inventory mutation"', () => {
    expect(tieneCamposInventario({ nv: '1', estado: 'En Proceso' })).toBe(false);
    expect(tieneCamposInventario({ sku: 'X', cantidad: 5 })).toBe(true);
    expect(tieneCamposInventario({ wms_move_stock: true })).toBe(true);
  });
});

describe('PR-016 · preflight (validación centralizada de guardado)', () => {
  const base = { mode: 'create', estado: ESTADOS.EN_PROCESO };

  it('requiere estado para guardar', () => {
    expect(requiereEstado({})).not.toBeNull();
    expect(requiereEstado(base)).toBeNull();
  });

  it('pausa Shipping exige motivo al cambiar el subestado', () => {
    expect(
      pausaShippingRequiereMotivo(
        { mode: 'update', shippingSubestado: 'PENDIENTE', shippingPausaMotivo: '' },
        ''
      )
    ).not.toBeNull();
    expect(
      pausaShippingRequiereMotivo(
        {
          mode: 'update',
          shippingSubestado: 'PENDIENTE',
          shippingPausaMotivo: 'Falta documentación'
        },
        ''
      )
    ).toBeNull();
  });

  it('pausa Shipping activa bloquea avanzar a En Ruta', () => {
    expect(
      pausaShippingBloqueaAvance({ estado: ESTADOS.EN_RUTA }, 'PENDIENTE', ESTADOS.SHIPPING)
    ).not.toBeNull();
    expect(
      pausaShippingBloqueaAvance({ estado: ESTADOS.SHIPPING }, 'PENDIENTE', ESTADOS.SHIPPING)
    ).toBeNull();
  });

  it('bloquea por IAM si no hay permiso de edición (salvo transición restringida)', () => {
    expect(
      requiereAccesoIAM(
        { mode: 'update' },
        { editAccess: { permitida: false }, canSubmitRestrictedUpdate: false }
      )
    ).not.toBeNull();
    expect(
      requiereAccesoIAM(
        { mode: 'update' },
        { editAccess: { permitida: false }, canSubmitRestrictedUpdate: true }
      )
    ).toBeNull();
    expect(
      requiereAccesoIAM(
        { mode: 'update' },
        { editAccess: { permitida: true }, canSubmitRestrictedUpdate: false }
      )
    ).toBeNull();
  });

  it('una N.V. Entregada se bloquea (solo reapertura)', () => {
    expect(
      entregadaBloquea({ lookupResult: { found: true, data: { estado: 'Entregado' } } })
    ).not.toBeNull();
    expect(
      entregadaBloquea({ lookupResult: { found: true, data: { estado: ESTADOS.EN_RUTA } } })
    ).toBeNull();
  });

  it('cliente Orange exige N.V. asociada', () => {
    expect(
      requiereAsociacionOrange({
        orangeAssociationRequired: true,
        orangeAssociationNv: '',
        orangeAssociationData: null
      })
    ).not.toBeNull();
    expect(
      requiereAsociacionOrange({
        orangeAssociationRequired: true,
        orangeAssociationNv: 'OR-1',
        orangeAssociationData: {}
      })
    ).toBeNull();
  });

  it('creación exige cliente (salvo canal Varios)', () => {
    expect(calidadDatos({ mode: 'create', canal: 'ptm' }, { autoFill: {} })).not.toBeNull();
    expect(
      calidadDatos({ mode: 'create', canal: 'ptm' }, { autoFill: { cliente: 'Farmacia X' } })
    ).toBeNull();
    expect(calidadDatos({ mode: 'create', canal: 'varios' }, { autoFill: {} })).toBeNull();
  });

  it('preflightGuardar agrega todos los problemas y primerProblema prioriza', () => {
    const st = {
      mode: 'update',
      estado: '',
      shippingSubestado: 'PENDIENTE',
      shippingPausaMotivo: ''
    };
    const pf = preflightGuardar(st, {
      originalShippingSubestado: '',
      estadoOriginal: 'En Proceso',
      editAccess: { permitida: false },
      canSubmitRestrictedUpdate: false,
      autoFill: {}
    });
    expect(pf.ok).toBe(false);
    expect(pf.problems.length).toBeGreaterThanOrEqual(3);
    expect(primerProblema(pf).code).toBe('ESTADO_REQUERIDO');
  });

  it('preflight pasa cuando el contexto es válido', () => {
    const pf = preflightGuardar(
      { mode: 'create', estado: ESTADOS.EN_PROCESO, canal: 'ptm' },
      { autoFill: { cliente: 'Farmacia X' }, editAccess: { permitida: true } }
    );
    expect(pf.ok).toBe(true);
    expect(pf.problems).toEqual([]);
  });
});

describe('PR-016 · optimistic version (row_version como versión)', () => {
  it('deriva la versión de la fila (row_version bigint)', () => {
    expect(versionDeRow({ row_version: 14 })).toBe(14);
    expect(versionDeRow({ row_version: '7' })).toBe(7);
    expect(versionDeRow({ row_version: null })).toBeNull();
    expect(versionDeRow({})).toBeNull();
    expect(versionDeRow(null)).toBeNull();
  });

  it('lee la versión desde el payload', () => {
    expect(versionDePayload({ [VERSION_FIELD]: 14 })).toBe(14);
    expect(versionDePayload({})).toBeNull();
  });

  it('versión actual vs. enviada (comparación numérica exacta)', () => {
    expect(versionEsActual(14, 14)).toBe(true);
    expect(versionEsActual('14', 14)).toBe(true);
    expect(versionEsActual(13, 14)).toBe(false);
    expect(versionEsActual(null, 14)).toBe(true); // compat mode: sin versión no hay gate
    expect(versionEsActual(14, null)).toBe(true);
  });

  it('detecta y tipifica un conflicto de versión', () => {
    expect(esConflicto({ conflict: true })).toBe(true);
    expect(esConflicto({ code: ERROR_CODES.CONFLICT })).toBe(true);
    expect(esConflicto({ ok: true })).toBe(false);

    const res = resultadoConflicto({ version: 14 });
    expect(res).toMatchObject({
      ok: false,
      conflict: true,
      code: ERROR_CODES.CONFLICT,
      version: 14
    });
    expect(res.message.length).toBeGreaterThan(10);
  });

  it('detecta cuando la RPC exige versión (fase D / version_required)', () => {
    expect(esVersionRequerida({ version_required: true })).toBe(true);
    expect(esVersionRequerida({ conflict: true })).toBe(false);
    expect(esVersionRequerida({ ok: true })).toBe(false);
  });
});

describe('PR-016 · UX de conflicto (diff legible servidor vs. local)', () => {
  it('lista los campos que otro operador cambió (cargado → servidor)', () => {
    const loaded = { transportista: 'CORREOS', guia: '123' };
    const server = { transportista: 'BLUEXPRESS', guia: '123' };
    const diff = diffNvConflict(loaded, server, {});
    expect(diff.serverChanges).toEqual([
      { label: 'Transportista', de: 'CORREOS', a: 'BLUEXPRESS' }
    ]);
    expect(diff.tusChanges).toEqual([]);
  });

  it('lista lo que el usuario intentó escribir y no se aplicó', () => {
    const loaded = { transportista: 'CORREOS', guia: '123' };
    const server = { transportista: 'BLUEXPRESS', guia: '123' };
    const intent = { transportista: 'ANDESMAR', guia: '999' };
    const diff = diffNvConflict(loaded, server, intent);
    expect(diff.tusChanges).toEqual([
      { label: 'Transportista', a: 'ANDESMAR' },
      { label: 'Guía', a: '999' }
    ]);
  });

  it('sin cambios entre cargado y servidor → no reporta serverChanges', () => {
    const diff = diffNvConflict({ transportista: 'X' }, { transportista: 'X' }, {});
    expect(diff.serverChanges).toEqual([]);
    expect(diff.tusChanges).toEqual([]);
  });
});
