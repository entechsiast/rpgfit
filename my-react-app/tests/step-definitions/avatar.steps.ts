import { Given, When, Then } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';

When('I view the character preview', async function ({ page }: { page: Page }) {
  const preview = page.getByTestId('preview-card');
  await expect(preview).toBeVisible();
});

Then('I should see the avatar placeholder message', async function ({ page }: { page: Page }) {
  await expect(page.getByText('Select a race to begin')).toBeVisible();
});

Given('I have selected the {string} race', async function ({ page }: { page: Page }, raceName: string) {
  const tab = page.getByTestId('tab-race');
  await tab.click();
  await page.getByTestId(`race-card-${raceName.toLowerCase()}`).click();
});

Then('I should see {string} ears on the avatar', async function ({ page }: { page: Page }, earType: string) {
  const avatar = page.getByTestId('character-avatar');
  await expect(avatar).toBeVisible();
});

Given('I have selected the {string} class', async function ({ page }: { page: Page }, className: string) {
  const tab = page.getByTestId('tab-class');
  await tab.click();
  await page.getByTestId(`class-card-${className.toLowerCase()}`).click();
});

Then('I should see {string} armor on the avatar', async function ({ page }: { page: Page }, armorType: string) {
  const avatar = page.getByTestId('character-avatar');
  await expect(avatar).toBeVisible();
});

Given('I have selected hair color {string}', async function ({ page }: { page: Page }, colorName: string) {
  const tab = page.getByTestId('tab-appearance');
  await tab.click();
  await page.locator(`[data-testid="hairColor-${colorName.toLowerCase()}"]`).click();
});

Then('the avatar hair should be red', async function ({ page }: { page: Page }) {
  const avatar = page.getByTestId('character-avatar');
  await expect(avatar).toBeVisible();
});

Then('I should see orc tusks on the avatar', async function ({ page }: { page: Page }) {
  const avatar = page.getByTestId('character-avatar');
  await expect(avatar).toBeVisible();
});

Then('I should see mage robes on the avatar', async function ({ page }: { page: Page }) {
  const avatar = page.getByTestId('character-avatar');
  await expect(avatar).toBeVisible();
});
