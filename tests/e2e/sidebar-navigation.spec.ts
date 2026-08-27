import { expect, test } from '@playwright/test';

const HARNESS = '/tests/visual/sidebar-v2.harness.html';

test.describe('NAV-001 · Sidebar V2', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(HARNESS);
  });

  test('expanded y collapsed mantienen navegación completa sin duplicados', async ({ page }) => {
    const sidebar = page.getByLabel('Navegación principal');
    await expect(sidebar).toHaveAttribute('data-collapsed', 'false');
    await expect(sidebar).toHaveCSS('width', '252px');
    await expect(page.getByAltText('PTM Health Care')).toBeVisible();

    await page.getByRole('button', { name: 'Colapsar menú' }).click();
    await expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    await expect(sidebar).toHaveCSS('width', '72px');

    const groups = sidebar.locator('[data-sidebar-group]');
    const groupCount = await groups.count();
    for (let index = 0; index < groupCount; index += 1) {
      await expect(groups.nth(index).locator(':scope > a, :scope > button')).toHaveCount(1);
    }

    await page.getByRole('button', { name: 'Abrir Admin' }).click();
    await expect(page.getByRole('group', { name: 'Rutas de Admin' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Control de Acceso' })).toBeVisible();
  });

  test('flyout responde a teclado y se mantiene dentro del viewport', async ({ page }) => {
    await page.getByRole('button', { name: 'Colapsar menú' }).click();
    const trigger = page.getByRole('button', { name: 'Abrir Admin' });
    await trigger.focus();
    await trigger.press('Enter');

    const flyout = page.getByRole('group', { name: 'Rutas de Admin' });
    await expect(flyout).toBeVisible();
    const box = await flyout.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);

    await page.keyboard.press('Escape');
    await expect(flyout).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  for (const viewport of [
    { width: 1024, height: 768 },
    { width: 1280, height: 800 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 }
  ]) {
    test(`sin overflow a ${viewport.width}×${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(HARNESS);
      const metrics = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth
      }));
      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);

      await page.getByRole('button', { name: 'Colapsar menú' }).click();
      await page.getByRole('button', { name: 'Abrir Admin' }).click();
      const flyout = page.getByRole('group', { name: 'Rutas de Admin' });
      await expect(flyout).toBeVisible();
      const box = await flyout.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
    });
  }
});
