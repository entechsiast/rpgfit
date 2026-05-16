import { Given, When, Then } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';

Given('I am on the home page', async function ({ page }: { page: Page }) {
  await page.goto('/');
  await expect(page.getByTestId('home-title')).toBeVisible();
});

Then('I should see {string} as the title', async function ({ page }: { page: Page }, title: string) {
  await expect(page.getByTestId('home-title')).toContainText(title);
});

Then('I should see a {string} button', async function ({ page }: { page: Page }, buttonText: string) {
  await expect(page.getByRole('button', { name: buttonText })).toBeVisible();
});

When('I click the "([^"]*)" button', async function ({ page }: { page: Page }, buttonText: string) {
  await page.getByRole('button', { name: buttonText }).click();
});

Given('I am on the character creator page', async function ({ page }: { page: Page }) {
  await page.goto('/creator');
  await expect(page.getByText('Character Creator')).toBeVisible();
});

Then('I should be on the {string} page', async function ({ page }: { page: Page }, route: string) {
  await expect(page).toHaveURL(route);
});

Then('I should see the {string} title', async function ({ page }: { page: Page }, title: string) {
  await expect(page.getByText(title)).toBeVisible();
});

Given('I am on an unknown route {string}', async function ({ page }: { page: Page }, route: string) {
  await page.goto(route);
});

Then('I should be redirected to the home page', async function ({ page }: { page: Page }) {
  await expect(page).toHaveURL('/');
});
