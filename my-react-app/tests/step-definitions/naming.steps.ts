import { Given, When, Then } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';

Then('I should see {string} as the character name', async function ({ page }: { page: Page }, name: string) {
  await expect(page.getByTestId('preview-name')).toContainText(name);
});

Then('I should see {string} in the preview header', async function ({ page }: { page: Page }, name: string) {
  await expect(page.getByText(name)).toBeVisible();
});

When('I click on the character name', async function ({ page }: { page: Page }) {
  await page.getByTestId('preview-name').click();
});

Given('the character name is {string}', async function ({ page }: { page: Page }, name: string) {
  await page.getByTestId('preview-name').click();
  await page.getByTestId('name-edit-input').fill(name);
  await page.getByTestId('name-save-btn').click();
});

Then('the name input field should be visible', async function ({ page }: { page: Page }) {
  await expect(page.getByTestId('name-edit-input')).toBeVisible();
});

Then('the input field should be focused', async function ({ page }: { page: Page }) {
  await expect(page.getByTestId('name-edit-input')).toBeFocused();
});

When('I type {string} into the name input', async function ({ page }: { page: Page }, name: string) {
  await page.getByTestId('name-edit-input').fill(name);
});

When('I save the name', async function ({ page }: { page: Page }) {
  await page.getByTestId('name-save-btn').click();
});

Then('the character name should display {string}', async function ({ page }: { page: Page }, name: string) {
  await expect(page.getByTestId('preview-name')).toContainText(name);
});

Given('I have set the hero name to {string}', async function ({ page }: { page: Page }, name: string) {
  await page.getByTestId('preview-name').click();
  await page.getByTestId('name-edit-input').fill(name);
  await page.getByTestId('name-save-btn').click();
});

When('I press Escape', async function ({ page }: { page: Page }) {
  await page.getByTestId('name-edit-input').press('Escape');
});

Then('the character name should still be {string}', async function ({ page }: { page: Page }, name: string) {
  await expect(page.getByTestId('preview-name')).toContainText(name);
});

When('I type a 31 character name into the name input', async function ({ page }: { page: Page }) {
  const longName = 'A'.repeat(31);
  await page.getByTestId('name-edit-input').fill(longName);
});

Then('the name input should not accept the 31st character', async function ({ page }: { page: Page }) {
  const value = await page.getByTestId('name-edit-input').inputValue();
  expect(value.length).toBeLessThanOrEqual(30);
});
