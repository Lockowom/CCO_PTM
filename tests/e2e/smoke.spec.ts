import { expect, test } from '@playwright/test';

test('@smoke carga login del CCO', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle(/CCO|PTM/i);
});
