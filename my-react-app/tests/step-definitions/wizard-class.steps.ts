import { Given, When, Then } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';

When('I select the "Wizard" class', async function () {
  const page = this.page as Page;
  await page.getByTestId('class-card-wizard').click();
  await expect(page.getByTestId('class-card-wizard')).toHaveClass(/selected/);
});

Then('the Wizard card should be highlighted', async function () {
  const page = this.page as Page;
  await expect(page.getByTestId('class-card-wizard')).toHaveClass(/selected/);
});

Then('{string} should display the value {int}', async function (statName: string, value: number) {
  const page = this.page as Page;
  const statValue = await page.locator(`[data-testid="stat-${statName.toLowerCase()}"] .stat-value`).textContent();
  expect(parseInt(statValue || '0')).toBe(value);
});
