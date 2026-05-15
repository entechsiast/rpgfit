import { Given, When, Then } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';

Then('I should see {string} as the title', async function ({ page }: { page: Page }, title: string) {
  await expect(page.getByTestId('home-title')).toContainText(title);
});

Then('I should see a {string} button', async function ({ page }: { page: Page }, buttonText: string) {
  await expect(page.getByRole('button', { name: buttonText })).toBeVisible();
});

Given('I am on an unknown route {string}', async function ({ page }: { page: Page }, route: string) {
  await page.goto(route);
});

Then('I should be redirected to the home page', async function ({ page }: { page: Page }) {
  await expect(page).toHaveURL('/');
});
