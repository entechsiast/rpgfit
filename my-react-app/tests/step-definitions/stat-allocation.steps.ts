import { Given, When, Then } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';

Given('I am on the {string} tab', async function (tabName: string) {
  const page = this.page as Page;
  const tab = page.getByTestId(`tab-${tabName.toLowerCase()}`);
  await tab.click();
  await expect(tab).toHaveClass(/active/);
});

Then('each stat should display the value 8', async function () {
  const page = this.page as Page;
  const statValues = await page.locator('.stat-value').allTextContents();
  statValues.forEach(val => {
    expect(parseInt(val)).toBe(8);
  });
});

Then('I should see {string} points remaining', async function (text: string) {
  const page = this.page as Page;
  await expect(page.getByTestId('points-remaining')).toContainText(text);
});

Given('I have {string} points remaining', async function (text: string) {
  const page = this.page as Page;
  await expect(page.getByTestId('points-remaining')).toContainText(text);
});

When('I click the increment button for {string}', async function (statName: string) {
  const page = this.page as Page;
  const statRow = page.locator(`[data-testid="stat-${statName.toLowerCase()}"]`);
  await statRow.locator('[data-testid="stat-increment"]').click();
});

When('I click the decrement button for {string}', async function (statName: string) {
  const page = this.page as Page;
  const statRow = page.locator(`[data-testid="stat-${statName.toLowerCase()}"]`);
  await statRow.locator('[data-testid="stat-decrement"]').click();
});

Given('I have incremented {string} to {int}', async function (statName: string, value: number) {
  const page = this.page as Page;
  const current = await page.locator(`[data-testid="stat-${statName.toLowerCase()}"] .stat-value`).textContent();
  const currentVal = parseInt(current || '0');
  const diff = value - currentVal;
  for (let i = 0; i < diff; i++) {
    await page.locator(`[data-testid="stat-${statName.toLowerCase()}"] [data-testid="stat-increment"]`).click();
  }
});

Given('I have incremented {string} to 9', async function (statName: string) {
  const page = this.page as Page;
  await page.locator(`[data-testid="stat-${statName.toLowerCase()}"] [data-testid="stat-increment"]`).click();
});

Then('{string} should display the value {int}', async function (statName: string, value: number) {
  const page = this.page as Page;
  const statValue = await page.locator(`[data-testid="stat-${statName.toLowerCase()}"] .stat-value`).textContent();
  expect(parseInt(statValue || '0')).toBe(value);
});

Then('I should see {string}', async function (text: string) {
  const page = this.page as Page;
  await expect(page.getByTestId('points-remaining')).toContainText(text);
});

Then('the increment button for {string} should be disabled', async function (statName: string) {
  const page = this.page as Page;
  const btn = page.locator(`[data-testid="stat-${statName.toLowerCase()}"] [data-testid="stat-increment"]`);
  await expect(btn).toBeDisabled();
});

Then('the decrement button for {string} should be disabled', async function (statName: string) {
  const page = this.page as Page;
  const btn = page.locator(`[data-testid="stat-${statName.toLowerCase()}"] [data-testid="stat-decrement"]`);
  await expect(btn).toBeDisabled();
});

Given('I have allocated all 27 points', async function () {
  const page = this.page as Page;
  const statNames = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  for (const stat of statNames) {
    const current = await page.locator(`[data-testid="stat-${stat}"] .stat-value`).textContent();
    const currentVal = parseInt(current || '0');
    while (currentVal < 15) {
      await page.locator(`[data-testid="stat-${stat}"] [data-testid="stat-increment"]`).click();
    }
  }
  await expect(page.getByTestId('points-remaining')).toContainText('0 points remaining');
});

Then('the increment button should be disabled', async function () {
  const page = this.page as Page;
  const firstBtn = page.locator('[data-testid="stat-str"] [data-testid="stat-increment"]');
  await expect(firstBtn).toBeDisabled();
});
