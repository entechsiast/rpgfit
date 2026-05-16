import { Given, When, Then } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';

Then('I should see {string} as the character name', async function (name: string) {
  const page = this.page as Page;
  await expect(page.getByTestId('preview-name')).toContainText(name);
});

Then('I should see {string} in the preview header', async function (name: string) {
  const page = this.page as Page;
  await expect(page.getByText(name)).toBeVisible();
});

When('I click on the character name', async function () {
  const page = this.page as Page;
  await page.getByTestId('preview-name').click();
});

Given('the character name is {string}', async function (name: string) {
  const page = this.page as Page;
  await page.getByTestId('preview-name').click();
  await page.getByTestId('name-edit-input').fill(name);
  await page.getByTestId('name-save-btn').click();
});

Then('the name input field should be visible', async function () {
  const page = this.page as Page;
  await expect(page.getByTestId('name-edit-input')).toBeVisible();
});

Then('the input field should be focused', async function () {
  const page = this.page as Page;
  await expect(page.getByTestId('name-edit-input')).toBeFocused();
});

When('I type {string} into the name input', async function (name: string) {
  const page = this.page as Page;
  await page.getByTestId('name-edit-input').fill(name);
});

When('I save the name', async function () {
  const page = this.page as Page;
  await page.getByTestId('name-save-btn').click();
});

Then('the character name should display {string}', async function (name: string) {
  const page = this.page as Page;
  await expect(page.getByTestId('preview-name')).toContainText(name);
});

Given('I have set the hero name to {string}', async function (name: string) {
  const page = this.page as Page;
  await page.getByTestId('preview-name').click();
  await page.getByTestId('name-edit-input').fill(name);
  await page.getByTestId('name-save-btn').click();
});

When('I press Escape', async function () {
  const page = this.page as Page;
  await page.getByTestId('name-edit-input').press('Escape');
});

Then('the character name should still be {string}', async function (name: string) {
  const page = this.page as Page;
  await expect(page.getByTestId('preview-name')).toContainText(name);
});

When('I type a 31 character name into the name input', async function () {
  const page = this.page as Page;
  const longName = 'A'.repeat(31);
  await page.getByTestId('name-edit-input').fill(longName);
});

Then('the name input should not accept the 31st character', async function () {
  const page = this.page as Page;
  const value = await page.getByTestId('name-edit-input').inputValue();
  expect(value.length).toBeLessThanOrEqual(30);
});
