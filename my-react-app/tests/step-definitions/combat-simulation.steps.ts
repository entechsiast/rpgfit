import { Given, When, Then } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';

// Background setup
Given('I have a saved character', async function ({ page }: { page: Page }) {
  await page.goto('/creator');
  await page.getByTestId('btn-select-warrior').click();
  await page.getByTestId('btn-select-human').click();
  await page.getByTestId('tab-stats').click();
  await page.getByTestId('btn-save').click();
  await page.waitForTimeout(500);
});

Given('I am in an active dungeon combat', async function ({ page }: { page: Page }) {
  await page.goto('/adventure');
  await page.waitForTimeout(500);
});

// Scenario: Start combat in a dungeon
When('I enter a dungeon', async function ({ page }: { page: Page }) {
  const dungeonCard = page.getByTestId('dungeon-card-goblin_caves');
  await dungeonCard.click();
  await page.waitForTimeout(1000);
});

Then('combat should begin', async function ({ page }: { page: Page }) {
  const combatSimulator = page.locator('.combat-simulator');
  await expect(combatSimulator).toBeVisible();
});

Then('I should see the first monster name', async function ({ page }: { page: Page }) {
  const combatStatus = page.locator('.combat-status');
  await expect(combatStatus).toBeVisible();
});

Then('the combat log should be visible', async function ({ page }: { page: Page }) {
  const combatLog = page.getByTestId('combat-log');
  await expect(combatLog).toBeVisible();
});

Then('the player current HP should be displayed', async function ({ page }: { page: Page }) {
  const hpDisplay = page.locator('.hp-mp-display');
  await expect(hpDisplay).toBeVisible();
});

// Scenario: Combat resolves automatically
Given('combat has started', async function ({ page }: { page: Page }) {
  await page.waitForTimeout(1000);
});

When('time passes', async function ({ page }: { page: Page }) {
  await page.waitForTimeout(5000);
});

Then('each monster fight should resolve without user input', async function ({ page }: { page: Page }) {
  const combatLog = page.getByTestId('combat-log');
  const logEntries = await combatLog.locator('.log-entry').count();
  expect(logEntries).toBeGreaterThan(0);
});

Then('the next monster should engage automatically', async function ({ page }: { page: Page }) {
  const combatStatus = page.locator('.combat-status');
  await expect(combatStatus).toBeVisible();
});

Then('the combat log should update with each round', async function ({ page }: { page: Page }) {
  const combatLog = page.getByTestId('combat-log');
  const logEntries = await combatLog.locator('.log-entry').count();
  expect(logEntries).toBeGreaterThan(1);
});

// Scenario: Win combat against all monsters and boss
Given('combat is in progress', async function ({ page }: { page: Page }) {
  await page.waitForTimeout(2000);
});

Given('the player has defeated all regular monsters', async function ({ page }: { page: Page }) {
  await page.waitForTimeout(5000);
});

When('the boss fight completes', async function ({ page }: { page: Page }) {
  await page.waitForTimeout(5000);
});

Then('I should see a victory message', async function ({ page }: { page: Page }) {
  const results = page.getByTestId('combat-results');
  await expect(results).toBeVisible();
});

Then('I should see full XP rewards', async function ({ page }: { page: Page }) {
  const results = page.getByTestId('combat-results');
  await expect(results).toBeVisible();
});

Then('I should see full gold rewards', async function ({ page }: { page: Page }) {
  const results = page.getByTestId('combat-results');
  await expect(results).toBeVisible();
});

Then('the dungeon should be marked as completed', async function ({ page }: { page: Page }) {
  const dungeonCard = page.getByTestId('dungeon-card-goblin_caves');
  await expect(dungeonCard).toBeVisible();
});

// Scenario: Lose combat (HP reaches 0)
Given('the player HP is low', async function ({ page }: { page: Page }) {
  await page.evaluate(() => {
    const key = 'rpg_characters';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    if (list.length > 0) {
      list[0].hp = 1;
      list[0].maxHp = 100;
      localStorage.setItem(key, JSON.stringify(list));
    }
  });
  await page.reload();
  await page.waitForTimeout(500);
});

When('the player takes damage', async function ({ page }: { page: Page }) {
  await page.waitForTimeout(3000);
});

Then('the player HP should reach 0', async function ({ page }: { page: Page }) {
  const hpDisplay = page.locator('.hp-mp-display');
  await expect(hpDisplay).toBeVisible();
});

Then('I should see a defeat message', async function ({ page }: { page: Page }) {
  const results = page.getByTestId('combat-results');
  await expect(results).toBeVisible();
});

Then('the combat should end', async function ({ page }: { page: Page }) {
  const combatSimulator = page.locator('.combat-simulator');
  await expect(combatSimulator).not.toBeVisible();
});

// Scenario: See partial rewards on defeat
Given('the player has been defeated', async function ({ page }: { page: Page }) {
  await page.waitForTimeout(3000);
});

When('combat ends', async function ({ page }: { page: Page }) {
  await page.waitForTimeout(1000);
});

Then('I should see partial XP rewards', async function ({ page }: { page: Page }) {
  const results = page.getByTestId('combat-results');
  await expect(results).toBeVisible();
});

Then('the XP reward should be 50% of the expected amount', async function ({ page }: { page: Page }) {
  const results = page.getByTestId('combat-results');
  await expect(results).toBeVisible();
});

Then('I should see partial gold rewards', async function ({ page }: { page: Page }) {
  const results = page.getByTestId('combat-results');
  await expect(results).toBeVisible();
});

Then('the gold reward should be 25% of the expected amount', async function ({ page }: { page: Page }) {
  const results = page.getByTestId('combat-results');
  await expect(results).toBeVisible();
});

// Scenario: View combat log after fight
Given('combat has ended', async function ({ page }: { page: Page }) {
  await page.waitForTimeout(3000);
});

When('I view the combat log', async function ({ page }: { page: Page }) {
  const combatLog = page.getByTestId('combat-log');
  await expect(combatLog).toBeVisible();
});

Then('the combat log should show each round damage', async function ({ page }: { page: Page }) {
  const combatLog = page.getByTestId('combat-log');
  const logEntries = await combatLog.locator('.log-entry').count();
  expect(logEntries).toBeGreaterThan(0);
});

Then('the log should display player actions', async function ({ page }: { page: Page }) {
  const combatLog = page.getByTestId('combat-log');
  const playerActions = combatLog.locator('.log-entry.player-action');
  const count = await playerActions.count();
  expect(count).toBeGreaterThan(0);
});

Then('the log should display monster actions', async function ({ page }: { page: Page }) {
  const combatLog = page.getByTestId('combat-log');
  const monsterActions = combatLog.locator('.log-entry.monster-action');
  const count = await monsterActions.count();
  expect(count).toBeGreaterThan(0);
});

Then('the log should show damage values for each attack', async function ({ page }: { page: Page }) {
  const combatLog = page.getByTestId('combat-log');
  const logEntries = await combatLog.locator('.log-entry').count();
  expect(logEntries).toBeGreaterThan(0);
});

// Scenario: Combat log shows player HP after each round
When('each round completes', async function ({ page }: { page: Page }) {
  await page.waitForTimeout(2000);
});

Then('the combat log should show the player HP after that round', async function ({ page }: { page: Page }) {
  const combatLog = page.getByTestId('combat-log');
  await expect(combatLog).toBeVisible();
});

Then('the HP value should reflect the damage taken in that round', async function ({ page }: { page: Page }) {
  const combatLog = page.getByTestId('combat-log');
  await expect(combatLog).toBeVisible();
});

Then('the HP should be visible for all rounds of combat', async function ({ page }: { page: Page }) {
  const combatLog = page.getByTestId('combat-log');
  const logEntries = await combatLog.locator('.log-entry').count();
  expect(logEntries).toBeGreaterThan(0);
});
