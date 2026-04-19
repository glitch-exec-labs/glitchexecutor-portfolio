import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('home renders hero + has skip link + brand nav', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Glitch Executor/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/money, prices, and signals/i);
    // Skip link is rendered and points at #main.
    const skip = page.locator('a.skip-link');
    await expect(skip).toHaveAttribute('href', '#main');
    // Nav shows brand wordmark.
    await expect(page.getByRole('banner').getByText(/Executor/)).toBeVisible();
  });

  test('portfolio grid links to each sub-brand', async ({ page }) => {
    await page.goto('/');
    for (const host of ['trade.glitchexecutor.com', 'edge.glitchexecutor.com', 'grow.glitchexecutor.com']) {
      await expect(page.locator(`a[href*="${host}"]`).first()).toBeVisible();
    }
  });

  test('section anchors render (portfolio, how, milestones, faq, contact)', async ({ page }) => {
    await page.goto('/');
    for (const id of ['portfolio', 'how', 'milestones', 'faq', 'contact']) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  });

  test('legal + thanks render without errors', async ({ page }) => {
    for (const path of ['/legal/privacy', '/legal/terms', '/thanks']) {
      const resp = await page.goto(path);
      expect(resp?.status(), path).toBeLessThan(400);
      await expect(page.getByRole('heading', { level: 1 }), path).toBeVisible();
    }
  });

  test('JSON-LD organization + website blocks present on home', async ({ page }) => {
    await page.goto('/');
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const merged = blocks.join('\n');
    expect(merged).toContain('"Organization"');
    expect(merged).toContain('"WebSite"');
  });

  test('robots + sitemap are reachable', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toMatch(/Sitemap:/);
    const sitemap = await request.get('/sitemap-index.xml');
    expect(sitemap.status()).toBe(200);
  });

  test('no obvious console errors on home', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto('/');
    // `load`, not `networkidle`: Turnstile + analytics scripts can keep the
    // network busy indefinitely on localhost (unauthorized hostname, poll loops).
    // `load` is sufficient — any console error from our own code fires before it.
    await page.waitForLoadState('load');
    expect(errors, errors.join('\n')).toEqual([]);
  });
});
