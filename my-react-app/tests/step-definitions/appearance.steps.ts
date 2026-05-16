import { Given, When, Then } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';

When('I select hair color {string}', async function (colorName: string) {
  const page = this.page as Page;
  const btn = page.locator(`[data-testid="hairColor-${colorName.toLowerCase()}"]`);
  await btn.click();
});

Then('the selected hair color should be {string}', async function (colorName: string) {
  const page = this.page as Page;
  const btn = page.locator(`[data-testid="hairColor-${colorName.toLowerCase()}"]`);
  await expect(btn).toHaveClass(/selected/);
});

When('I select skin tone {string}', async function (toneName: string) {
  const page = this.page as Page;
  const btn = page.locator(`[data-testid="skinTone-${toneName.toLowerCase()}"]`);
  await btn.click();
});

Then('the selected skin tone should be {string}', async function (toneName: string) {
  const page = this.page as Page;
  const btn = page.locator(`[data-testid="skinTone-${toneName.toLowerCase()}"]`);
  await expect(btn).toHaveClass(/selected/);
});

When('I select eye color {string}', async function (colorName: string) {
  const page = this.page as Page;
  const btn = page.locator(`[data-testid="eyeColor-${colorName.toLowerCase()}"]`);
  await btn.click();
});

Then('the selected eye color should be {string}', async function (colorName: string) {
  const page = this.page as Page;
  const btn = page.locator(`[data-testid="eyeColor-${colorName.toLowerCase()}"]`);
  await expect(btn).toHaveClass(/selected/);
});

When('I select hair style {string}', async function (styleName: string) {
  const page = this.page as Page;
  const btn = page.locator(`[data-testid="hairStyle-${styleName.toLowerCase()}"]`);
  await btn.click();
});

Then('the selected hair style should be {string}', async function (styleName: string) {
  const page = this.page as Page;
  const btn = page.locator(`[data-testid="hairStyle-${styleName.toLowerCase()}"]`);
  await expect(btn).toHaveClass(/selected/);
});

When('I select build {string}', async function (buildName: string) {
  const page = this.page as Page;
  const btn = page.locator(`[data-testid="build-${buildName.toLowerCase()}"]`);
  await btn.click();
});

Then('the selected build should be {string}', async function (buildName: string) {
  const page = this.page as Page;
  const btn = page.locator(`[data-testid="build-${buildName.toLowerCase()}"]`);
  await expect(btn).toHaveClass(/selected/);
});
