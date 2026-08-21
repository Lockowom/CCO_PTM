import { expect, test } from '@playwright/test';
import { PUBLIC_VISUAL_ROUTES, VISUAL_BREAKPOINTS } from './visual-routes';

test.use({ colorScheme: 'light' });
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

for (const route of PUBLIC_VISUAL_ROUTES) {
  for (const viewport of VISUAL_BREAKPOINTS) {
    test(`@visual ${route} ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(route, { waitUntil: 'networkidle' });
      await expect(page.locator('body')).toBeVisible();
      await expect(page).toHaveScreenshot(`${route.slice(1)}-${viewport.name}.png`, {
        animations: 'disabled',
        caret: 'hide',
        maxDiffPixelRatio: 0.01
      });
    });
  }
}
