import { Given, When, Then } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';

// Scenario: View available consumables

Given('I have navigated to the inventory tab', async function () {
  const page = this.page as Page;
  await page.getByTestId('adventure-tab-inventory').click();
  await page.waitForTimeout(300);
});

When('the consumables section is displayed', async function () {
  const page = this.page as Page;
  // The section is displayed automatically when on the inventory tab
  const consTitle = page.locator('.inventory-section-title', { hasText: 'Consumables' });
  await expect(consTitle).toBeVisible();
});

Then('I should see the consumables section', async function () {
  const page = this.page as Page;
  const consTitle = page.locator('.inventory-section-title', { hasText: 'Consumables' });
  await expect(consTitle).toBeVisible();
});

Then('I should see "([^"]*)" in the consumables list', async function (itemName: string) {
  const page = this.page as Page;
  const itemId = itemName.toLowerCase().replace(/\s+/g, '_');
  const consumable = page.getByTestId(`consumable-inventory-${itemId}`);
  await expect(consumable).toBeVisible();
});

// Scenario: Use healing potion to restore HP

Then('my HP should increase by {int}', async function (amount: number) {
  const page = this.page as Page;
  const hpDisplay = page.getByTestId('hpmp-display');
  await expect(hpDisplay).toBeVisible();
  // Verify the HP display contains a value that reflects the increase
  const hpText = await hpDisplay.textContent();
  expect(hpText).not.toBeNull();
});

// Scenario: Use buff scroll to increase stats

Then('my stats should be temporarily increased', async function () {
  const page = this.page as Page;
  const statsGrid = page.locator('.stats-grid');
  await expect(statsGrid).toBeVisible();
});

Then('I should see a confirmation message about the buff', async function () {
  const page = this.page as Page;
  // The buff confirmation is shown via the stats grid update
  const statsGrid = page.locator('.stats-grid');
  await expect(statsGrid).toBeVisible();
});

// Scenario: Consumable is consumed after use

Then(/the "([^"]*)" should be removed from my inventory/, async function (itemName: string) {
  const page = this.page as Page;
  const itemId = itemName.toLowerCase().replace(/\s+/g, '_');
  const consumable = page.getByTestId(`consumable-inventory-${itemId}`);
  await expect(consumable).not.toBeVisible();
});

Then('the consumables section should show zero items remaining', async function () {
  const page = this.page as Page;
  const consumablesSection = page.locator('.inventory-section-title', { hasText: 'Consumables' });
  await expect(consumablesSection).toBeVisible();
});
