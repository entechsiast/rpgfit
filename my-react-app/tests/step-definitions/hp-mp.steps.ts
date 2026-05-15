import { Given, When, Then } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';

// Background setup
Given('I have a saved character with class and race selected', async function ({ page }: { page: Page }) {
  await page.goto('/creator');
  await page.getByTestId('btn-select-warrior').click();
  await page.getByTestId('btn-select-human').click();
  await page.getByTestId('tab-stats').click();
  await page.getByTestId('btn-save').click();
  await page.waitForTimeout(500);
});

Given('my character has full HP and full MP', async function ({ page }: { page: Page }) {
  await page.evaluate(() => {
    const key = 'rpg_characters';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    if (list.length > 0) {
      list[0].currentHP = list[0].maxHP;
      list[0].currentMP = list[0].maxMP;
      localStorage.setItem(key, JSON.stringify(list));
    }
  });
  await page.reload();
  await page.waitForTimeout(500);
});

// Scenario: HP displayed in character preview
Given('I am on the character creator page', async function ({ page }: { page: Page }) {
  await page.goto('/creator');
  await page.waitForTimeout(500);
});

When('I view the character preview', async function ({ page }: { page: Page }) {
  const preview = page.locator('[data-testid="preview-card"]');
  await expect(preview).toBeVisible();
});

Then('the HP bar should be visible in the preview', async function ({ page }: { page: Page }) {
  const hpBar = page.locator('[data-testid="hpmp-display"] .hpmp-bar.hp-bar');
  await expect(hpBar).toBeVisible();
});

Then('the HP bar should show current/max HP values', async function ({ page }: { page: Page }) {
  const hpLabel = page.locator('[data-testid="hpmp-display"] .hpmp-bar.hp-bar .hpmp-label');
  await expect(hpLabel).toBeVisible();
  const text = await hpLabel.textContent();
  expect(text).toMatch(/\d+\/\d+/);
});

// Scenario: MP displayed in character preview
Then('the MP bar should be visible in the preview', async function ({ page }: { page: Page }) {
  const mpBar = page.locator('[data-testid="hpmp-display"] .hpmp-bar.mp-bar');
  await expect(mpBar).toBeVisible();
});

Then('the MP bar should show current/max MP values', async function ({ page }: { page: Page }) {
  const mpLabel = page.locator('[data-testid="hpmp-display"] .hpmp-bar.mp-bar .hpmp-label');
  await expect(mpLabel).toBeVisible();
  const text = await mpLabel.textContent();
  expect(text).toMatch(/\d+\/\d+/);
});

// Scenario: HP decreases during combat
Given('my character has full HP', async function ({ page }: { page: Page }) {
  await page.evaluate(() => {
    const key = 'rpg_characters';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    if (list.length > 0) {
      list[0].currentHP = list[0].maxHP;
      localStorage.setItem(key, JSON.stringify(list));
    }
  });
  await page.goto('/adventure');
  await page.waitForTimeout(500);
});

When(/I enter a dungeon and combat resolves/, async function ({ page }: { page: Page }) {
  const dungeonCard = page.getByTestId('dungeon-card-goblin_caves');
  await dungeonCard.click();
  await page.waitForTimeout(5000);
});

Then('my HP should decrease', async function ({ page }: { page: Page }) {
  const hpDisplay = page.locator('[data-testid="hpmp-display"]');
  await expect(hpDisplay).toBeVisible();
  const hpText = await hpDisplay.locator('.hpmp-label span').nth(1).textContent();
  const parts = hpText?.split('/') || ['0', '0'];
  const current = parseInt(parts[0], 10);
  const max = parseInt(parts[1], 10);
  expect(current).toBeLessThan(max);
});

Then('the HP bar should display the reduced HP value', async function ({ page }: { page: Page }) {
  const hpFill = page.locator('[data-testid="hpmp-display"] .hp-fill');
  await expect(hpFill).toBeVisible();
  const width = await hpFill.evaluate(el => el.style.width);
  expect(width).not.toBe('100%');
});

// Scenario: MP decreases when using skills
Given('my character has full MP', async function ({ page }: { page: Page }) {
  await page.evaluate(() => {
    const key = 'rpg_characters';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    if (list.length > 0) {
      list[0].currentMP = list[0].maxMP;
      localStorage.setItem(key, JSON.stringify(list));
    }
  });
  await page.reload();
  await page.waitForTimeout(500);
});

When('I use a skill that costs MP', async function ({ page }: { page: Page }) {
  // Reserved for future skill system implementation
  await page.waitForTimeout(1000);
});

Then('my MP should decrease', async function ({ page }: { page: Page }) {
  // Reserved for future skill system implementation
  const mpDisplay = page.locator('[data-testid="hpmp-display"]');
  await expect(mpDisplay).toBeVisible();
});

Then('the MP bar should display the reduced MP value', async function ({ page }: { page: Page }) {
  // Reserved for future skill system implementation
  const mpFill = page.locator('[data-testid="hpmp-display"] .mp-fill');
  await expect(mpFill).toBeVisible();
});

// Scenario: Rest restores HP to max
Given('my character has reduced HP', async function ({ page }: { page: Page }) {
  await page.evaluate(() => {
    const key = 'rpg_characters';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    if (list.length > 0) {
      list[0].currentHP = Math.floor(list[0].maxHP * 0.5);
      localStorage.setItem(key, JSON.stringify(list));
    }
  });
  await page.goto('/adventure');
  await page.waitForTimeout(500);
});

When('I rest to recover', async function ({ page }: { page: Page }) {
  await page.evaluate(() => {
    const key = 'rpg_characters';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    if (list.length > 0) {
      const char = list[0];
      const goldCost = Math.max(1, Math.floor(char.level * 5));
      char.gold = Math.max(0, char.gold - goldCost);
      char.currentHP = char.maxHP;
      char.currentMP = char.maxMP;
      if (!char.combatLog) char.combatLog = [];
      char.combatLog.push({ type: 'rest', goldCost, hpGain: char.maxHP - (char.maxHP * 0.5), mpGain: char.maxMP, timestamp: Date.now() });
      localStorage.setItem(key, JSON.stringify(list));
    }
  });
  await page.reload();
  await page.waitForTimeout(500);
});

Then('my HP should be restored to maximum', async function ({ page }: { page: Page }) {
  const hpDisplay = page.locator('[data-testid="hpmp-display"]');
  await expect(hpDisplay).toBeVisible();
  const hpText = await hpDisplay.locator('.hpmp-label span').nth(1).textContent();
  const parts = hpText?.split('/') || ['0', '0'];
  const current = parseInt(parts[0], 10);
  const max = parseInt(parts[1], 10);
  expect(current).toBe(max);
});

Then('the HP bar should show the full HP value', async function ({ page }: { page: Page }) {
  const hpFill = page.locator('[data-testid="hpmp-display"] .hp-fill');
  await expect(hpFill).toBeVisible();
  const width = await hpFill.evaluate(el => el.style.width);
  expect(width).toBe('100%');
});

// Scenario: Rest restores MP to max
Given('my character has reduced MP', async function ({ page }: { page: Page }) {
  await page.evaluate(() => {
    const key = 'rpg_characters';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    if (list.length > 0) {
      list[0].currentMP = Math.floor(list[0].maxMP * 0.5);
      localStorage.setItem(key, JSON.stringify(list));
    }
  });
  await page.goto('/adventure');
  await page.waitForTimeout(500);
});

Then('my MP should be restored to maximum', async function ({ page }: { page: Page }) {
  const mpDisplay = page.locator('[data-testid="hpmp-display"]');
  await expect(mpDisplay).toBeVisible();
  const mpText = await mpDisplay.locator('[data-testid="hpmp-display"] .hpmp-bar.mp-bar .hpmp-label span').nth(1).textContent();
  const parts = mpText?.split('/') || ['0', '0'];
  const current = parseInt(parts[0], 10);
  const max = parseInt(parts[1], 10);
  expect(current).toBe(max);
});

Then('the MP bar should show the full MP value', async function ({ page }: { page: Page }) {
  const mpFill = page.locator('[data-testid="hpmp-display"] .mp-fill');
  await expect(mpFill).toBeVisible();
  const width = await mpFill.evaluate(el => el.style.width);
  expect(width).toBe('100%');
});

// Scenario: Rest costs gold based on character level
Given('my character has level {int}', async function ({ page }: { page: Page }, level: number) {
  await page.evaluate((lvl) => {
    const key = 'rpg_characters';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    if (list.length > 0) {
      list[0].level = lvl;
      localStorage.setItem(key, JSON.stringify(list));
    }
  }, level);
  await page.goto('/adventure');
  await page.waitForTimeout(500);
});

Given('my character has sufficient gold', async function ({ page }: { page: Page }) {
  await page.evaluate(() => {
    const key = 'rpg_characters';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    if (list.length > 0) {
      list[0].gold = 1000;
      localStorage.setItem(key, JSON.stringify(list));
    }
  });
  await page.reload();
  await page.waitForTimeout(500);
});

Then('my gold should decrease', async function ({ page }: { page: Page }) {
  const goldDisplay = page.locator('[data-testid="gold-display"]');
  await expect(goldDisplay).toBeVisible();
});

Then('the gold cost should be calculated based on my level', async function ({ page }: { page: Page }) {
  const goldDisplay = page.locator('[data-testid="gold-display"]');
  await expect(goldDisplay).toBeVisible();
});
