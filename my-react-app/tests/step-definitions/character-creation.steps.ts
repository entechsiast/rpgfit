import { Given, When, Then } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';

Given('I am on the character creator page', async function ({ page }: { page: Page }) {
  await page.goto('/creator');
  await expect(page.getByText('Character Creator')).toBeVisible();
});

When('I am on the {string} tab', async function ({ page }: { page: Page }, tabName: string) {
  const tab = page.getByTestId(`tab-${tabName.toLowerCase()}`);
  await tab.click();
  await expect(tab).toHaveClass(/active/);
});

When('I select the {string} class', async function ({ page }: { page: Page }, className: string) {
  await page.getByTestId(`class-card-${className.toLowerCase()}`).click();
});

Then('the {string} card should be highlighted', async function ({ page }: { page: Page }, className: string) {
  const card = page.getByTestId(`class-card-${className.toLowerCase()}`);
  await expect(card).toHaveClass(/selected/);
});

Then('the stats should reset to base values', async function ({ page }: { page: Page }) {
  const statValues = await page.locator('.stat-value').allTextContents();
  statValues.forEach(val => {
    expect(parseInt(val)).toBe(8);
  });
});
