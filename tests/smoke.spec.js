// @ts-check
// Smoke tests: each page must load without uncaught exceptions and render
// its main content. Layout (horizontal overflow) is only asserted where the
// page is expected to be responsive today; game pages gain a narrow-width
// assertion as they are migrated to the responsive layout.
const { test, expect } = require('@playwright/test');

const WIDE = { width: 1280, height: 800 };
const NARROW = { width: 375, height: 700 };

/**
 * Loads a page collecting uncaught exceptions and console errors.
 * Resource-load failures (404s in a local static server) are ignored.
 */
async function loadPage(page, url, readySelector) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) {
      errors.push(`console: ${msg.text()}`);
    }
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector(readySelector, { timeout: 30000 });
  return errors;
}

async function hasHorizontalOverflow(page) {
  return page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth);
}

test.describe('index', () => {
  for (const viewport of [WIDE, NARROW]) {
    test(`loads cleanly at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const errors = await loadPage(page, '/index.html?lang=es', '#games svg');
      expect(errors).toEqual([]);
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });
  }
});

// `responsive: true` marks games migrated to the stacked narrow layout;
// those must also render without horizontal overflow at phone width.
const GAMES = [
  { url: '/maze.html?lang=es', ready: '#blockly svg', responsive: true },
  { url: '/turtle.html?lang=ca', ready: '#blockly svg', responsive: true },
  { url: '/bird.html?lang=es', ready: '#blockly svg', responsive: true },
  { url: '/movie.html?lang=es', ready: '#blockly svg', responsive: true },
  { url: '/music.html?lang=ca', ready: '#blockly svg', responsive: true },
  { url: '/dance.html?lang=es', ready: '#blockly svg', responsive: true },
  // Pond pages are excluded: they fire a pre-existing unhandled
  // rejection in headless browsers (audio autoplay policy).
];

for (const game of GAMES) {
  test.describe(game.url, () => {
    test(`loads cleanly at ${WIDE.width}px`, async ({ page }) => {
      await page.setViewportSize(WIDE);
      const errors = await loadPage(page, game.url, game.ready);
      expect(errors).toEqual([]);
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });

    test(`loads without errors at ${NARROW.width}px`, async ({ page }) => {
      await page.setViewportSize(NARROW);
      const errors = await loadPage(page, game.url, game.ready);
      expect(errors).toEqual([]);
      if (game.responsive) {
        expect(await hasHorizontalOverflow(page)).toBe(false);
      }
    });
  });
}
