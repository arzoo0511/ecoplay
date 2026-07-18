import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Core UI Quality Audits', () => {
  
  test('Home Page should pass Accessibility and Visual Regression checks', async ({ page }) => {
    // 1. Navigate to the application root
    await page.goto('/');
    
    // Wait for the hydration/rendering to settle down
    await page.waitForLoadState('networkidle');

    // 2. Run the Accessibility Scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag21aa']) // Standard accessibility criteria
      .analyze();

    // The test will fail if there are any core a11y violations
    expect(accessibilityScanResults.violations).toEqual([]);

    // 3. Run the Visual Regression Check
    // This takes a screenshot and matches it against a saved baseline image snippet
    await expect(page).toHaveScreenshot('home-page-baseline.png', {
      maxDiffPixelRatio: 0.02, // Allows for a negligible 2% threshold difference
    });
  });
});