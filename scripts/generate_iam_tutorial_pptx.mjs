import fs from 'node:fs/promises';
import path from 'node:path';
import PptxGenJS from 'pptxgenjs';
import { ROLE_BLUEPRINTS } from '../src/config/iamBlueprints.js';

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'TRAE';
pptx.company = 'CCO SYSTEM';
pptx.subject = 'Tutorial IAM Frontend Simplificado';
pptx.title = 'IAM Frontend Simplificado - CCO PTM';
pptx.lang = 'es-CL';
pptx.theme = {
  headFontFace: 'Montserrat',
  bodyFontFace: 'Montserrat',
  lang: 'es-CL',
};

const COLORS = {
  navy: '0D1B2A',
  orange: 'FF6D00',
  slate: '334155',
  light: 'F8FAFC',
  muted: '64748B',
  border: 'E2E8F0',
  soft: 'FFF7ED',
};

const currentUsersByRole = {
  ADMIN: ['admin@cco.cl', 'admin@sistema.com'],
  CONTROL_CALIDAD: ['mnegroni@ptm.cl'],
  GERENCIA: ['oleiva@ptm.cl'],
  INVENTARIO_: ['inventary@ptm.cl'],
  OPERADOR: ['jc@ptm.cl', 'lmodric@ptm.cl', 'moi@ptm.cl', 'picking1@ptm.cl', 'picking2@ptm.cl', 'packing@ptm.cl'],
  OPERARIO_3: ['chv@ptm.cl'],
  SUPERVISOR: ['gisselle@ptm.cl', 'nilo@ptm.cl'],
  SUPERVISOR_: ['angelica@ptm.cl'],
};

function addFrame(slide, title, subtitle = '') {
  slide.background = { color: 'FFFFFF' };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.45, fill: { color: COLORS.navy }, line: { color: COLORS.navy } });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0.45, w: 13.333, h: 0.12, fill: { color: COLORS.orange }, line: { color: COLORS.orange } });
  slide.addText(title, {
    x: 0.6, y: 0.85, w: 11.8, h: 0.55,
    fontFace: 'Montserrat', fontSize: 24, bold: true, color: COLORS.navy,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.6, y: 1.38, w: 11.8, h: 0.35,
      fontFace: 'Montserrat', fontSize: 10, color: COLORS.muted,
    });
  }
}

function addBulletList(slide, items, { x = 0.85, y = 1.95, w = 11.6, h = 4.8, fontSize = 15 } = {}) {
  slide.addText(
    items.map((text) => ({
      text,
      options: { bullet: { indent: 16 } },
    })),
    {
      x, y, w, h,
      fontFace: 'Montserrat',
      fontSize,
      color: COLORS.slate,
      valign: 'top',
      breakLine: false,
      paraSpaceAfterPt: 10,
      margin: 0.02,
    },
  );
}

function addRoleCard(slide, role, index) {
  const col = index % 2;
  const row = Math.floor(index / 2);
  const x = 0.65 + (col * 6.1);
  const y = 1.7 + (row * 1.35);
  const users = currentUsersByRole[role.id] || [];
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w: 5.75, h: 1.12,
    rectRadius: 0.08,
    fill: { color: row % 2 === 0 ? 'FFFFFF' : COLORS.soft },
    line: { color: COLORS.border, pt: 1 },
  });
  slide.addText(role.id, {
    x: x + 0.18, y: y + 0.12, w: 1.8, h: 0.2,
    fontFace: 'Montserrat', fontSize: 12, bold: true, color: COLORS.orange,
  });
  slide.addText(role.nombre, {
    x: x + 0.18, y: y + 0.32, w: 3.6, h: 0.18,
    fontFace: 'Montserrat', fontSize: 16, bold: true, color: COLORS.navy,
  });
  slide.addText(`Landing: ${role.landingPage}`, {
    x: x + 0.18, y: y + 0.58, w: 3.8, h: 0.16,
    fontFace: 'Montserrat', fontSize: 9, color: COLORS.muted,
  });
  slide.addText(`Permisos: ${role.permissions.length} | Usuarios: ${users.length}`, {
    x: x + 0.18, y: y + 0.78, w: 2.9, h: 0.16,
    fontFace: 'Montserrat', fontSize: 9, color: COLORS.slate,
  });
  slide.addText(users.slice(0, 3).join(' | ') || 'Sin usuarios actuales', {
    x: x + 3.0, y: y + 0.74, w: 2.45, h: 0.22,
    fontFace: 'Montserrat', fontSize: 8, color: COLORS.muted, align: 'right',
  });
}

const slide1 = pptx.addSlide();
slide1.background = { color: 'FFFFFF' };
slide1.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: COLORS.navy }, line: { color: COLORS.navy } });
slide1.addShape(pptx.ShapeType.rect, { x: 0.65, y: 0.8, w: 1.1, h: 0.14, fill: { color: COLORS.orange }, line: { color: COLORS.orange } });
slide1.addText('IAM Frontend Simplificado', {
  x: 0.65, y: 1.1, w: 8.6, h: 0.7,
  fontFace: 'Montserrat', fontSize: 28, bold: true, color: 'FFFFFF',
});
slide1.addText('Arquitectura lista, matriz de roles publicada, usuarios organizados y tutorial operativo reutilizable', {
  x: 0.65, y: 1.95, w: 8.8, h: 0.55,
  fontFace: 'Montserrat', fontSize: 14, color: 'DDE7F0',
});
slide1.addText('Proyecto CCO PTM | Julio 2026', {
  x: 0.65, y: 6.55, w: 4.3, h: 0.22,
  fontFace: 'Montserrat', fontSize: 10, color: 'DDE7F0',
});

const slide2 = pptx.addSlide();
addFrame(slide2, '1. Problema Que Resuelve', 'Por que se hizo este upgrade');
addBulletList(slide2, [
  'Habia demasiada dependencia de configuracion manual y permisos dispersos entre frontend, roles legacy e IAM.',
  'Los roles actuales existian, pero no habia una plantilla central legible para mantenerlos o extenderlos.',
  'Agregar un modulo nuevo obligaba a recordar permisos, rutas, tabs y sincronizaciones manuales.',
  'La entrega deja una fuente unica de verdad en frontend y una migracion que alinea la base remota con esa matriz.',
]);

const slide3 = pptx.addSlide();
addFrame(slide3, '2. Arquitectura Resultado', 'Que archivo manda sobre la definicion funcional');
addBulletList(slide3, [
  'Frontend: `src/config/iamBlueprints.js` define roles, landing pages, equipos y permisos oficiales.',
  'Catalogo funcional: `src/config/modules.js` conserva el inventario de permisos por modulo.',
  'Guardas UI: `src/constants/permissions.js` sigue resolviendo rutas y tabs protegidos.',
  'Persistencia: `tms_roles`, `tms_usuarios`, `iam.roles`, `iam.role_permissions`, `iam.assignments`, `iam.teams` y `iam.team_members`.',
  'Sincronizacion: `supabase/migrations/160_frontend_iam_role_blueprints.sql` publica la matriz y organiza usuarios.',
  'Enforcement real: frontend para visibilidad y backend para autorizacion efectiva.',
], { h: 5.2 });

const slide4 = pptx.addSlide();
addFrame(slide4, '3. Flujo De Mantenimiento', 'Regla futura para cambios seguros');
addBulletList(slide4, [
  'Nuevo permiso: se agrega en `APP_PERMISSIONS`, luego en `permissions.js` y despues en `iamBlueprints.js`.',
  'Nuevo rol: se define una sola vez en `iamBlueprints.js` con `landingPage`, `permissions` y `defaultTeamCode`.',
  'Nueva publicacion: se crea una migracion de sincronizacion y se ejecuta build antes del push.',
  'Nuevo usuario: se crea desde `Admin > Usuarios`, se asigna rol y el blueprint ya define su matriz funcional.',
], { h: 5.1 });

const slide5 = pptx.addSlide();
addFrame(slide5, '4. Roles Oficiales Publicados', 'Resumen ejecutivo de la matriz vigente');
ROLE_BLUEPRINTS.forEach((role, index) => addRoleCard(slide5, role, index));

const slide6 = pptx.addSlide();
addFrame(slide6, '5. Usuarios Actuales Organizados', 'Snapshot de la configuracion aplicada por rol');
addBulletList(slide6, [
  'ADMIN: admin@cco.cl | admin@sistema.com',
  'CONTROL_CALIDAD: mnegroni@ptm.cl',
  'GERENCIA: oleiva@ptm.cl',
  'INVENTARIO_: inventary@ptm.cl',
  'OPERADOR: jc@ptm.cl | lmodric@ptm.cl | moi@ptm.cl | picking1@ptm.cl | picking2@ptm.cl | packing@ptm.cl',
  'OPERARIO_3: chv@ptm.cl',
  'SUPERVISOR: gisselle@ptm.cl | nilo@ptm.cl',
  'SUPERVISOR_: angelica@ptm.cl',
], { h: 5.5, fontSize: 14 });

const slide7 = pptx.addSlide();
addFrame(slide7, '6. Equipos Creados', 'Orden tecnico para mantenimiento futuro');
addBulletList(slide7, [
  'La migracion crea un equipo tecnico por rol: `ROL_ADMIN`, `ROL_CONTROL_CALIDAD`, `ROL_GERENCIA`, `ROL_INVENTARIO`, `ROL_OPERADOR`, `ROL_OPERARIO_3`, `ROL_SUPERVISOR` y `ROL_SUPERVISOR_LEGACY`.',
  'Estos equipos dejan trazabilidad y organizacion sin reemplazar las asignaciones globales existentes.',
  'Si en el futuro necesitas herencia masiva real, puedes colgar permisos de team sin rehacer la matriz de roles.',
], { h: 4.9 });

const slide8 = pptx.addSlide();
addFrame(slide8, '7. Como Crear Un Modulo Nuevo', 'Checklist para no romper autorizacion');
addBulletList(slide8, [
  'Paso 1: agregar permisos nuevos en `src/config/modules.js`.',
  'Paso 2: mapear rutas y tabs en `src/constants/permissions.js`.',
  'Paso 3: incluir esos permisos en uno o mas roles dentro de `src/config/iamBlueprints.js`.',
  'Paso 4: crear migracion de sincronizacion para publicar la matriz en Supabase.',
  'Paso 5: si el modulo cambia datos sensibles, endurecer RPC o RLS del dominio.',
  'Paso 6: ejecutar `npm run build` y validar la vista con un usuario real.',
], { h: 5.2 });

const slide9 = pptx.addSlide();
addFrame(slide9, '8. Como Crear O Ajustar Un Rol', 'Tutorial operativo detallado');
addBulletList(slide9, [
  'Abrir `src/config/iamBlueprints.js` y duplicar la estructura de un rol existente.',
  'Definir `id`, `nombre`, `descripcion`, `landingPage`, `defaultTeamCode` y `permissions`.',
  'Mantener permisos pequenos y especificos: separar ver, gestionar, aprobar y tabs.',
  'Actualizar la migracion siguiente o crear una nueva para publicar el rol en `tms_roles`.',
  'Crear o reutilizar equipo tecnico del rol para orden operacional.',
], { h: 5.1 });

const slide10 = pptx.addSlide();
addFrame(slide10, '9. Como Dar De Alta Un Usuario', 'Procedimiento futuro sin improvisacion');
addBulletList(slide10, [
  'Entrar a `Admin > Usuarios`.',
  'Crear el usuario con nombre, email, password inicial y rol base.',
  'Confirmar que el rol exista en `iamBlueprints.js` y que el landing page sea el correcto.',
  'Guardar y validar la visibilidad real de rutas del rol.',
  'Si la accion sigue bloqueada, revisar la RPC o policy del dominio antes de tocar el rol.',
], { h: 4.8 });

const slide11 = pptx.addSlide();
addFrame(slide11, '10. Diagnostico De Bloqueos', 'Secuencia recomendada de soporte');
addBulletList(slide11, [
  'Revisar `tms_usuarios`: rol, activo, auth_uid.',
  'Revisar el blueprint del rol en `src/config/iamBlueprints.js`.',
  'Revisar rutas o tabs protegidos en `src/constants/permissions.js`.',
  'Revisar permisos efectivos y asignaciones IAM si el dominio esta endurecido.',
  'Si el problema es de negocio, revisar workflow, policy ABAC o RPC especifica.',
], { h: 4.9 });

const slide12 = pptx.addSlide();
addFrame(slide12, '11. Artefactos Entregados', 'Todo lo que queda listo en el repo');
addBulletList(slide12, [
  '`src/config/iamBlueprints.js` como matriz oficial de frontend.',
  '`supabase/migrations/160_frontend_iam_role_blueprints.sql` para sincronizar produccion.',
  '`docs/IAM_FRONTEND_SIMPLIFICADO.md` como manual tecnico-operativo.',
  '`scripts/generate_iam_tutorial_pptx.mjs` para regenerar esta presentacion.',
  'Resultado: roles organizados, usuarios alineados y base lista para modulos nuevos.',
], { h: 4.8 });

const outputPath = path.resolve('docs', 'IAM_FRONTEND_SIMPLIFICADO_TUTORIAL.pptx');
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await pptx.writeFile({ fileName: outputPath });
console.log(`PPTX generado en ${outputPath}`);
