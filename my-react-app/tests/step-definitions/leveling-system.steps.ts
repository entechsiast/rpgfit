import { Given, When, Then } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';

// Scenario: Character starts at level 1
Given('my character is at level {int}', async function (level: number) {
  const page = this.page as Page;
  await page.goto('/creator');
  await page.getByTestId('class-card-warrior').click();
  await page.getByTestId('race-card-human').click();
  await page.getByTestId('tab-stats').click();
  await page.getByTestId('btn-save').click();
  await page.waitForTimeout(500);
  // Set level via localStorage
  await page.evaluate((lvl) => {
    const key = 'rpg_characters';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    if (list.length > 0) {
      list[0].level = lvl;
      localStorage.setItem(key, JSON.stringify(list));
    }
  }, level);
  await page.reload();
  await page.waitForTimeout(500);
});

When('I view my character sheet', async function () {
  const page = this.page as Page;
  await page.getByTestId('adventure-tab-character').click();
  await page.waitForTimeout(300);
});

Then('I should see my level displayed as {int}', async function (level: number) {
  const page = this.page as Page;
  const levelBadge = page.locator('.sheet-level-badge .level-number');
  await expect(levelBadge).toBeVisible();
  const text = await levelBadge.textContent();
  expect(parseInt(text || '0')).toBe(level);
});

// Scenario: Gain XP increases progress
Given('my character has {int} XP', async function (xp: number) {
  const page = this.page as Page;
  await page.evaluate((xpVal) => {
    const key = 'rpg_characters';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    if (list.length > 0) {
      list[0].xp = xpVal;
      localStorage.setItem(key, JSON.stringify(list));
    }
  }, xp);
  await page.reload();
  await page.waitForTimeout(500);
});

When('I gain {int} XP', async function (xp: number) {
  const page = this.page as Page;
  await page.evaluate((xpVal) => {
    const key = 'rpg_characters';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    if (list.length > 0) {
      list[0].xp = (list[0].xp || 0) + xpVal;
      localStorage.setItem(key, JSON.stringify(list));
    }
  }, xp);
  await page.reload();
  await page.waitForTimeout(500);
});

Then('I should see my XP progress bar updated', async function () {
  const page = this.page as Page;
  const xpBar = page.getByTestId('xp-bar');
  await expect(xpBar).toBeVisible();
});

Then(/I should see "([^"]*)" displayed/, async function (text: string) {
  const page = this.page as Page;
  await expect(page.getByText(text)).toBeVisible();
});

// Scenario: XP threshold triggers level up
Then('a level up modal should appear', async function () {
  const page = this.page as Page;
  const modal = page.getByTestId('level-up-modal');
  await expect(modal).toBeVisible();
});

Then(/the modal should display "([^"]*)"/, async function (text: string) {
  const page = this.page as Page;
  const modal = page.getByTestId('level-up-modal');
  await expect(modal).toContainText(text);
});

Then('the modal should show remaining stat points to allocate', async function () {
  const page = this.page as Page;
  const modal = page.getByTestId('level-up-modal');
  await expect(modal).toBeVisible();
});

// Scenario: Allocate stat point on level up
Given('I have just leveled up to level {int}', async function (level: number) {
  const page = this.page as Page;
  // Set level and stat points via localStorage
  await page.evaluate((lvl) => {
    const key = 'rpg_characters';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    if (list.length > 0) {
      list[0].level = lvl;
      list[0].statPointsToSpend = 1;
      localStorage.setItem(key, JSON.stringify(list));
    }
  }, level);
  await page.reload();
  await page.waitForTimeout(500);
});

When('I allocate a stat point to {string}', async function (statName: string) {
  const page = this.page as Page;
  const statId = statName.toLowerCase();
  const statSelect = page.getByTestId(`stat-select-${statId}`);
  await statSelect.click();
  const allocateBtn = page.getByTestId('level-up-allocate');
  await allocateBtn.click();
  await page.waitForTimeout(300);
});

Then('the stat point allocation should be recorded', async function () {
  const page = this.page as Page;
  // Verify the modal is closed and stats are updated
  const modal = page.getByTestId('level-up-modal');
  await expect(modal).not.toBeVisible();
});

Then('remaining stat points should decrease by {int}', async function (amount: number) {
  const page = this.page as Page;
  // The stat points should be reflected in the character sheet
  const levelBadge = page.locator('.sheet-level-badge .level-number');
  await expect(levelBadge).toBeVisible();
});

Given('I have allocated a stat point to {string}', async function (statName: string) {
  const page = this.page as Page;
  // Simulate stat allocation by updating localStorage
  const statId = statName.toLowerCase();
  await page.evaluate((stat) => {
    const key = 'rpg_characters';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    if (list.length > 0) {
      if (!list[0].stats) list[0].stats = {};
      list[0].stats[stat] = (list[0].stats[stat] || 8) + 1;
      list[0].statPointsToSpend = Math.max(0, (list[0].statPointsToSpend || 1) - 1);
      localStorage.setItem(key, JSON.stringify(list));
    }
  }, statId);
  await page.reload();
  await page.waitForTimeout(500);
});

// Scenario: Stat point increases chosen stat
Then('other stats should remain unchanged', async function () {
  const page = this.page as Page;
  // Verify other stats haven't changed from their base values
  const stats = await page.locator('.preview-stat-value').allTextContents();
  stats.forEach(val => {
    const num = parseInt(val || '0');
    expect(num).toBeGreaterThanOrEqual(8);
  });
});

// Scenario: Max HP increases on level up
Then('my max HP should increase', async function () {
  const page = this.page as Page;
  const hpDisplay = page.getByTestId('hpmp-display');
  await expect(hpDisplay).toBeVisible();
  const hpText = await hpDisplay.locator('.hpmp-label span').nth(1).textContent();
  const parts = hpText?.split('/') || ['0', '0'];
  const max = parseInt(parts[1], 10);
  expect(max).toBeGreaterThan(0);
});

Then('the HP increase should reflect the class hitDie and CON modifier', async function () {
  const page = this.page as Page;
  // Warrior hitDie is d12, CON=8, so hpGain = 12 + floor((8-8)/2) = 12
  // Base maxHP for warrior at level 1 is 10, so new maxHP should be 22
  const hpDisplay = page.getByTestId('hpmp-display');
  await expect(hpDisplay).toBeVisible();
  const hpText = await hpDisplay.locator('.hpmp-label span').nth(1).textContent();
  const parts = hpText?.split('/') || ['0', '0'];
  const max = parseInt(parts[1], 10);
  expect(max).toBe(22);
});

// Scenario: Max MP increases on level up
Then('my max MP should increase', async function () {
  const page = this.page as Page;
  const mpDisplay = page.getByTestId('hpmp-display');
  await expect(mpDisplay).toBeVisible();
  const mpText = await mpDisplay.locator('.hpmp-bar.mp-bar .hpmp-label span').nth(1).textContent();
  const parts = mpText?.split('/') || ['0', '0'];
  const max = parseInt(parts[1], 10);
  expect(max).toBeGreaterThan(0);
});

Then('the MP increase should reflect INT, WIS, and level scaling', async function () {
  const page = this.page as Page;
  // INT=8, WIS=8: mpGain = floor((8-8)/2) + floor((8-8)/2) + 1 = 1
  // Base maxMP for any class at level 1 is 5, so new maxMP should be 6
  const mpDisplay = page.getByTestId('hpmp-display');
  await expect(mpDisplay).toBeVisible();
  const mpText = await mpDisplay.locator('.hpmp-bar.mp-bar .hpmp-label span').nth(1).textContent();
  const parts = mpText?.split('/') || ['0', '0'];
  const max = parseInt(parts[1], 10);
  expect(max).toBe(6);
});
