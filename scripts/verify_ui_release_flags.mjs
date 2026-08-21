const REQUIRED_V2_FLAGS = [
  'VITE_FF_WEB_SHELL_V2',
  'VITE_FF_WEB_DASHBOARD_V2',
  'VITE_FF_WEB_PANEL_NV_V2',
  'VITE_FF_WEB_INVENTORY_V2',
  'VITE_FF_WEB_INBOUND_V2',
  'VITE_FF_WEB_QUALITY_V2',
  'VITE_FF_WEB_POSTVENTA_V2',
  'VITE_FF_WEB_ROUTES_V2',
  'VITE_FF_WEB_TMS_V2',
  'VITE_FF_WEB_ADMIN_V2',
  'VITE_FF_WEB_LOGIN_V2',
  'VITE_FF_WEB_BUILDER_V2'
];

const targetArg = process.argv.find((arg) => arg.startsWith('--target='));
const target = targetArg?.split('=')[1];

if (!['beta', 'production'].includes(target)) {
  console.error('Uso: node scripts/verify_ui_release_flags.mjs --target=beta|production');
  process.exit(2);
}

const enabled = (key) => String(process.env[key] ?? '').toLowerCase() === 'true';
const invalid =
  target === 'beta'
    ? REQUIRED_V2_FLAGS.filter((key) => !enabled(key))
    : REQUIRED_V2_FLAGS.filter((key) => enabled(key));

if (invalid.length > 0) {
  const expected = target === 'beta' ? 'true' : 'false o ausente';
  console.error(`[ui-flags] ${target}: configuración inválida; se esperaba ${expected} en:`);
  invalid.forEach((key) => console.error(`- ${key}`));
  process.exit(1);
}

console.log(
  `[ui-flags] ${target}: PASS (${REQUIRED_V2_FLAGS.length} flags V2 ${
    target === 'beta' ? 'activados' : 'apagados'
  }).`
);
