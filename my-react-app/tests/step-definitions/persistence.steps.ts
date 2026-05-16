import { Given, When, Then } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';

Given('I have created a character with the name {string}', async function (name: string) {
  const page = this.page as Page;
  await page.getByTestId('preview-name').click();
  await page.getByTestId('name-edit-input').fill(name);
  await page.getByTestId('name-save-btn').click();
});

When('I click the save button', async function () {
  const page = this.page as Page;
  await page.getByTestId('btn-save').click();
});

Then('I should see a {string} confirmation', async function (text: string) {
  const page = this.page as Page;
  await expect(page.getByText(text)).toBeVisible();
});

Then('the character should be stored in localStorage', async function () {
  const page = this.page as Page;
  const stored = await page.evaluate(() => localStorage.getItem('rpg_characters'));
  expect(stored).not.toBeNull();
});

Given('I have saved a character named {string} in localStorage', async function (name: string) {
  const page = this.page as Page;
  await page.goto('/creator');
  await page.getByTestId('preview-name').click();
  await page.getByTestId('name-edit-input').fill(name);
  await page.getByTestId('name-save-btn').click();
  await page.getByTestId('btn-save').click();
});

When('I navigate to the character creator page', async function () {
  const page = this.page as Page;
  await page.goto('/creator');
});

Then('the character name should be loaded as {string}', async function (name: string) {
  const page = this.page as Page;
  await expect(page.getByTestId('preview-name')).toContainText(name);
});

When('I click the reset button', async function () {
  const page = this.page as Page;
  await page.getByTestId('btn-reset').click();
  await page.waitForTimeout(300);
});

Then('the character name should be empty', async function () {
  const page = this.page as Page;
  await expect(page.getByTestId('preview-name')).toContainText('Unnamed Hero');
});

Then('the class should be unselected', async function () {
  const page = this.page as Page;
  const selectedCards = page.locator('.class-card.selected');
  await expect(selectedCards).toHaveCount(0);
});

Then('the race should be unselected', async function () {
  const page = this.page as Page;
  const selectedCards = page.locator('.race-card.selected');
  await expect(selectedCards).toHaveCount(0);
});

Given('I have saved a character in localStorage', async function () {
  const page = this.page as Page;
  await page.goto('/creator');
  await page.getByTestId('preview-name').click();
  await page.getByTestId('name-edit-input').fill('TestHero');
  await page.getByTestId('name-save-btn').click();
  await page.getByTestId('btn-save').click();
});

Then('the localStorage should be cleared', async function () {
  const page = this.page as Page;
  const stored = await page.evaluate(() => localStorage.getItem('rpg_characters'));
  expect(stored).toBeNull();
});
