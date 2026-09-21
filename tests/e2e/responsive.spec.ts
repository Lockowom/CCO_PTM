import { expect, test } from '@playwright/test';

const VIEWPORTS = [
  [320, 568],
  [320, 720],
  [360, 640],
  [360, 720],
  [360, 800],
  [375, 812],
  [390, 844],
  [412, 915],
  [430, 932],
  [480, 960],
  [600, 960],
  [568, 320],
  [640, 360],
  [800, 360],
  [768, 1024],
  [1024, 768],
  [1280, 800],
  [1366, 768],
  [1440, 900],
  [1920, 1080]
] as const;

const PUBLIC_ROUTES = ['/login', '/consulta'];

for (const route of PUBLIC_ROUTES) {
  for (const [width, height] of VIEWPORTS) {
    test(`@responsive ${route} ${width}x${height} no tiene overflow crítico`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      // El body puede quedar marcado como no visible por el splash de la app aunque
      // el documento ya exista y pueda medirse. La prueba certifica geometría, no
      // el estado transitorio del splash; la acción primaria de login se verifica
      // aparte con una aserción visible.
      await expect(page.locator('#root')).toBeAttached();

      const geometry = await page.evaluate(() => ({
        viewport: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth
      }));

      expect(geometry.documentWidth, JSON.stringify(geometry)).toBeLessThanOrEqual(
        geometry.viewport + 1
      );
      expect(geometry.bodyWidth, JSON.stringify(geometry)).toBeLessThanOrEqual(
        geometry.viewport + 1
      );
    });
  }
}

test('@responsive login conserva acción primaria a 320x720', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/login');
  const submit = page.getByRole('button', { name: /iniciar sesión/i });
  await expect(submit).toBeVisible();
  await submit.scrollIntoViewIfNeeded();
  const box = await submit.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(320);
});
