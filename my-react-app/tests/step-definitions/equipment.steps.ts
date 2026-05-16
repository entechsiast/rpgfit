import { Given, When, Then } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';

When('I filter by slot {string}', async function ({ page }: { page: Page }, slotName: string) {
  const slotMap: Record<string, string> = {
    'Head': 'head',
    'Chest': 'chest',
    'Pants': 'pants',
    'Boots': 'boots',
    'Weapons': 'rightHand',
    'Left Hand': 'leftHand',
    'Accessories': 'accessory1',
  };
  const filterId = slotMap[slotName] || slotName;
  await page.getByTestId(`filter-slot-${filterId}`).click();
});

When('I filter by rarity {string}', async function ({ page }: { page: Page }, rarity: string) {
  const rarityMap: Record<string, string> = {
    'Common': 'common',
    'Uncommon': 'uncommon',
    'Rare': 'rare',
    'Epic': 'epic',
  };
  await page.getByTestId('filter-rarity').selectOption(rarityMap[rarity] || rarity.toLowerCase());
});

Then('I should see {string}', async function ({ page }: { page: Page }, text: string) {
  await expect(page.getByText(text)).toBeVisible();
});

Then('I should see the {string} item', async function ({ page }: { page: Page }, itemName: string) {
  await expect(page.getByText(itemName)).toBeVisible();
});

Then('I should not see {string}', async function ({ page }: { page: Page }, text: string) {
  const elements = page.getByText(text);
  const count = await elements.count();
  expect(count).toBe(0);
});

When('I equip the {string} item', async function ({ page }: { page: Page }, itemName: string) {
  await page.getByText(itemName).first().click();
});

Then('the {string} slot should show {string}', async function ({ page }: { page: Page }, slotName: string, itemName: string) {
  const slotId = slotName.toLowerCase();
  const slot = page.getByTestId(`equipment-slot-${slotId}`);
  await expect(slot.getByText(itemName)).toBeVisible();
});

When('I unequip the item from the {string} slot', async function ({ page }: { page: Page }, slotName: string) {
  const slotId = slotName.toLowerCase();
  const slot = page.getByTestId(`equipment-slot-${slotId}`);
  await slot.getByTestId(`unequip-${slotId}`).click();
});

Then('the {string} slot should be empty', async function ({ page }: { page: Page }, slotName: string) {
  const slotId = slotName.toLowerCase();
  const slot = page.getByTestId(`equipment-slot-${slotId}`);
  await expect(slot.getByText('Empty')).toBeVisible();
});

Given('the {string} is equipped to the {string} slot', async function ({ page }: { page: Page }, itemName: string, slotName: string) {
  const slotId = slotName.toLowerCase();
  const slot = page.getByTestId(`equipment-slot-${slotId}`);
  if (!(await slot.getByText(itemName).isVisible())) {
    await page.getByText(itemName).first().click();
  }
});

Then('the {string} stat should show the base value plus {int}', async function ({ page }: { page: Page }, statName: string, bonus: number) {
  const statValue = await page.locator(`[data-testid="stat-${statName.toLowerCase()}"] .preview-stat-value`).textContent();
  expect(parseInt(statValue || '0')).toBe(8 + bonus);
});

Then('the {string} bonus should be visible', async function ({ page }: { page: Page }, statName: string) {
  const bonusEl = page.locator(`[data-testid="stat-${statName.toLowerCase()}"] .preview-stat-bonus`);
  await expect(bonusEl).toBeVisible();
});

Then('the STR bonus should be removed', async function ({ page }: { page: Page }) {
  const bonusEl = page.locator('[data-testid="stat-str"] .preview-stat-bonus');
  await expect(bonusEl).not.toBeVisible();
});

Then('the item should be displayed with a {string} rarity color', async function ({ page }: { page: Page }, rarity: string) {
  const colorMap: Record<string, string> = {
    'rare': '#3b82f6',
    'epic': '#a855f7',
  };
  await expect(page.locator('.equipment-item-card')).toHaveCSS('border-color', colorMap[rarity] || '');
});
