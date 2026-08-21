import { expect, test } from '@playwright/test';

test('@a11y login es operable sólo con teclado', async ({ page }) => {
  await page.goto('/login');

  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Correo o identificador')).toBeFocused();
  await page.keyboard.type('usuario@ptm.cl');

  await page.keyboard.press('Tab');
  await expect(page.getByRole('textbox', { name: 'Contraseña' })).toBeFocused();
  await page.keyboard.type('secreto-prueba');

  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Mostrar contraseña' })).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );

  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeFocused();
});

test('@a11y consulta pública expone nombres accesibles y estados', async ({ page }) => {
  await page.goto('/consulta');
  const search = page.getByLabel('Buscar nota de venta, factura, guía o número de envío');
  await expect(search).toBeVisible();
  await search.fill('94994');
  await expect(page.getByRole('button', { name: 'Limpiar búsqueda' })).toBeVisible();
});

test('@a11y reduced motion desactiva animaciones continuas', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/login');
  const duration = await page
    .getByLabel('Correo o identificador')
    .evaluate((node) => getComputedStyle(node).transitionDuration);
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.01);
});
