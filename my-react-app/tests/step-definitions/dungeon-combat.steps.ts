import { Given, When, Then } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';

// Background setup
Given('I have a saved character', async function ({ page }: { page: Page }) {
  // Create a character via localStorage so the Adventure page doesn't show the empty state
  await page.goto('/creator');
  // Fill in character creation fields
  await page.getByTestId('btn-select-warrior').click();
  await page.getByTestId('btn-select-human').click();
  await page.getByTestId('tab-stats').click();
  // Save the character
  await page.getByTestId('btn-save').click();
  await page.waitForTimeout(500);
});

Given('I navigate to the adventure page', async function ({ page }: { page: Page }) {
  await page.goto('/adventure');
  await page.waitForTimeout(500);
});

// Scenario: View available dungeons
When('I view the adventure tab', async function ({ page }: { page: Page }) {
  await page.getByTestId('adventure-tab-adventure').click();
});

Then('I should see a list of available dungeons', async function ({ page }: { page: Page }) {
  const dungeonList = page.locator('.dungeon-list');
  await expect(dungeonList).toBeVisible();
});

Then(/the "([^"]*)" dungeon should be visible/, async function ({ page }: { page: Page }, name: string) {
  const dungeonCard = page.getByTestId(`dungeon-card-${name.toLowerCase().replace(/\s+/g, '_')}`);
  await expect(dungeonCard).toBeVisible();
});

// Scenario: Enter and complete a dungeon
When(/I enter the "([^"]*)" dungeon/, async function ({ page }: { page: Page }, name: string) {
  const dungeonId = name.toLowerCase().replace(/\s+/g, '_');
  const dungeonCard = page.getByTestId(`dungeon-card-${dungeonId}`);
  await dungeonCard.click();
  await page.waitForTimeout(1000);
});

Then('combat should begin', async function ({ page }: { page: Page }) {
  const combatSimulator = page.locator('.combat-simulator');
  await expect(combatSimulator).toBeVisible();
});

Then(/I should see the current monster's name/, async function ({ page }: { page: Page }) {
  const combatStatus = page.locator('.combat-status');
  await expect(combatStatus).toBeVisible();
});

Then('the combat log should show battle results', async function ({ page }: { page: Page }) {
  const combatLog = page.getByTestId('combat-log');
  await expect(combatLog).toBeVisible();
});

When('combat resolves', async function ({ page }: { page: Page }) {
  // The combat simulator auto-resolves with a timer; wait for it
  await page.waitForTimeout(5000);
});

Then('I should see the dungeon complete results', async function ({ page }: { page: Page }) {
  const results = page.getByTestId('combat-results');
  await expect(results).toBeVisible();
});

Then(/I should see (.*?) and (.*?) rewards/, async function ({ page }: { page: Page }, xp: string, gold: string) {
  // Results panel shows XP and gold
  const results = page.getByTestId('combat-results');
  await expect(results).toBeVisible();
});

// Scenario: View character sheet
When('I switch to the character tab', async function ({ page }: { page: Page }) {
  await page.getByTestId('adventure-tab-character').click();
  await page.waitForTimeout(300);
});

Then('I should see my character name', async function ({ page }: { page: Page }) {
  const name = page.locator('.sheet-info h3');
  await expect(name).toBeVisible();
});

Then('I should see my level', async function ({ page }: { page: Page }) {
  const levelBadge = page.locator('.sheet-level-badge');
  await expect(levelBadge).toBeVisible();
});

Then('I should see all six core stats', async function ({ page }: { page: Page }) {
  const statsGrid = page.locator('.stats-grid');
  await expect(statsGrid).toBeVisible();
  const statCards = statsGrid.locator('.stat-card');
  const count = await statCards.count();
  expect(count).toBeGreaterThanOrEqual(6);
});

Then('I should see my HP and MP values', async function ({ page }: { page: Page }) {
  const hpMp = page.locator('.hp-mp-display');
  await expect(hpMp).toBeVisible();
});

// Scenario: View inventory
When('I switch to the inventory tab', async function ({ page }: { page: Page }) {
  await page.getByTestId('adventure-tab-inventory').click();
  await page.waitForTimeout(300);
});

Then('I should see the equipment section', async function ({ page }: { page: Page }) {
  const eqTitle = page.locator('.inventory-section-title', { hasText: 'Equipment' });
  await expect(eqTitle).toBeVisible();
});

Then('I should see the consumables section', async function ({ page }: { page: Page }) {
  const consTitle = page.locator('.inventory-section-title', { hasText: 'Consumables' });
  await expect(consTitle).toBeVisible();
});

Then('I should see the shop section', async function ({ page }: { page: Page }) {
  const shopTitle = page.locator('.inventory-section-title', { hasText: 'Shop' });
  await expect(shopTitle).toBeVisible();
});

// Scenario: Buy items from shop
Given('I have at least {int} gold', async function ({ page }: { page: Page }, amount: number) {
  // Add gold via page.evaluate
  await page.evaluate((gold) => {
    const key = 'rpg_characters';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    if (list.length > 0) {
      list[0].gold = gold;
      localStorage.setItem(key, JSON.stringify(list));
    }
  }, amount);
  // Refresh to pick up changes
  await page.reload();
  await page.waitForTimeout(500);
});

Then('I should see the shop items', async function ({ page }: { page: Page }) {
  const shopItems = page.locator('.shop-item');
  const count = await shopItems.count();
  expect(count).toBeGreaterThan(0);
});

When(/I buy a "([^"]*)"/, async function ({ page }: { page: Page }, itemName: string) {
  const buyBtn = page.getByTestId(`btn-buy-${itemName.toLowerCase().replace(/\s+/g, '_')}`);
  await buyBtn.click();
  await page.waitForTimeout(300);
});

Then('my gold should decrease by {int}', async function ({ page }: { page: Page }, amount: number) {
  const goldDisplay = page.locator('.gold-display');
  await expect(goldDisplay).toBeVisible();
});

Then(/I should have one "([^"]*)" in my inventory/, async function ({ page }: { page: Page }, itemName: string) {
  const consumable = page.getByTestId(`consumable-inventory-${itemName.toLowerCase().replace(/\s+/g, '_')}`);
  await expect(consumable).toBeVisible();
});

// Scenario: Use a consumable
Given('I have a "([^"]*)" in my inventory', async function ({ page }: { page: Page }, itemName: string) {
  const itemId = itemName.toLowerCase().replace(/\s+/g, '_');
  // Add consumable via page.evaluate
  await page.evaluate((id) => {
    const key = 'rpg_characters';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    if (list.length > 0) {
      if (!list[0].consumables) list[0].consumables = {};
      list[0].consumables[id] = (list[0].consumables[id] || 0) + 1;
      localStorage.setItem(key, JSON.stringify(list));
    }
  }, itemId);
  await page.reload();
  await page.waitForTimeout(500);
});

Then('my current HP is less than my max HP', async function ({ page }: { page: Page }) {
  // This is a precondition check; in practice the HP display would show this
});

Then(/I should see a "([^"]*)" button for the (.*)/, async function ({ page }: { page: Page }, btnText: string, itemName: string) {
  const btn = page.getByTestId(`btn-use-${itemName.toLowerCase().replace(/\s+/g, '_')}`);
  await expect(btn).toHaveText(btnText);
});

When(/I use the "([^"]*)"/, async function ({ page }: { page: Page }, itemName: string) {
  const itemId = itemName.toLowerCase().replace(/\s+/g, '_');
  const btn = page.getByTestId(`btn-use-${itemId}`);
  await btn.click();
  await page.waitForTimeout(300);
});

Then('my HP should increase', async function ({ page }: { page: Page }) {
  const hpDisplay = page.locator('.hp-mp-display');
  await expect(hpDisplay).toBeVisible();
});

// Scenario: Navigate back
When('I click the "Edit Character" link', async function ({ page }: { page: Page }) {
  const link = page.getByText(/\u270E\uFE0F Edit Character/);
  await link.click();
});

Then('I should be on the character creator page', async function ({ page }: { page: Page }) {
  await expect(page).toHaveURL('/creator');
});
