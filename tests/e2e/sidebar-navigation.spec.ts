import { expect, test } from '@playwright/test';

const HARNESS = '/tests/visual/sidebar-v2.harness.html';

test.describe('NAV-002 · Sidebar operacional', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(HARNESS);
  });

  test('expanded y collapsed mantienen navegación completa sin duplicados', async ({ page }) => {
    const sidebar = page.getByLabel('Navegación principal');
    await expect(sidebar).toHaveAttribute('data-collapsed', 'false');
    await expect(sidebar).toHaveCSS('width', '252px');
    await expect(page.getByAltText('PTM Health Care')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Operación' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Sistema' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Notificaciones' })).toBeVisible();
    await expect(page.getByText('Cristopher Cabezas')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();

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

  test('panel de notificaciones abre a la derecha, respeta viewport y devuelve foco', async ({
    page
  }) => {
    const trigger = page.getByRole('button', { name: 'Notificaciones' });
    await trigger.click();
    const panel = page.getByLabel('Centro de notificaciones');
    await expect(panel).toBeVisible();
    const box = await panel.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(72);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);

    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('@visual estados NAV-002', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(HARNESS);
    await expect(page).toHaveScreenshot('sidebar-nav002-expanded.png', {
      animations: 'disabled',
      fullPage: false
    });

    await page.getByRole('button', { name: 'Colapsar menú' }).click();
    await expect(page).toHaveScreenshot('sidebar-nav002-collapsed.png', {
      animations: 'disabled',
      fullPage: false
    });

    await page.getByRole('button', { name: 'Expandir menú' }).click();
    await expect(page.getByLabel('Sesión y sistema')).toHaveScreenshot(
      'sidebar-nav002-footer.png',
      { animations: 'disabled' }
    );

    await page.getByRole('button', { name: 'Notificaciones' }).click();
    await expect(page.getByLabel('Centro de notificaciones')).toBeVisible();
    await expect(page).toHaveScreenshot('sidebar-nav002-notifications.png', {
      animations: 'disabled',
      fullPage: false
    });
  });

  for (const viewport of [
    { width: 1366, height: 650 },
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
      const adminTrigger = page.getByRole('button', { name: 'Abrir Admin' });
      await adminTrigger.scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);
      await adminTrigger.click();
      const flyout = page.getByRole('group', { name: 'Rutas de Admin' });
      await expect(flyout).toBeVisible();
      const box = await flyout.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
    });
  }
});
