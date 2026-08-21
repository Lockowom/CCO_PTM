import { expect, test } from '@playwright/test';

for (const route of ['/login', '/consulta']) {
  test(`@performance ${route} no bloquea el hilo principal al estabilizar`, async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __ccoLongTasks?: number[] }).__ccoLongTasks = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as Window & { __ccoLongTasks?: number[] }).__ccoLongTasks?.push(entry.duration);
        }
      }).observe({ type: 'longtask', buffered: true });
    });
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(500);
    const criticalLongTasks = await page.evaluate(() =>
      ((window as Window & { __ccoLongTasks?: number[] }).__ccoLongTasks || []).filter(
        (duration) => duration > 300
      )
    );
    expect(criticalLongTasks).toEqual([]);
  });
}
