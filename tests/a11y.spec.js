// @ts-check
// Accessibility scan with axe. Only serious/critical violations fail,
// so minor contrast quibbles don't block deploys.
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const PAGES = ['/index.html?lang=es', '/maze.html?lang=es'];

for (const url of PAGES) {
  test(`axe scan: ${url}`, async ({ page }) => {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const results = await new AxeBuilder({ page })
        // Blockly's own injection div carries a prohibited aria-label;
        // that's third-party code we don't control.
        .exclude('.injectionDiv')
        .analyze();
    const severe = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical');
    const summary = severe.map(
        (v) => `${v.id} (${v.impact}): ${v.nodes.length} nodes — ${v.help}`);
    expect(summary).toEqual([]);
  });
}
