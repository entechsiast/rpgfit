import { Given, When, Then } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';

Given('I am on the home page', async function () {
  const page = this.page as Page;
  await page.goto('/');
  await expect(page.getByTestId('home-title')).toBeVisible();
});

Then('I should see {string} as the title', async function (title: string) {
  const page = this.page as Page;
  await expect(page.getByTestId('home-title')).toContainText(title);
});

Then('I should see a {string} button', async function (buttonText: string) {
  const page = this.page as Page;
  await expect(page.getByRole('button', { name: buttonText })).toBeVisible();
});

When('I click the "([^"]*)" button', async function (buttonText: string) {
  const page = this.page as Page;
  await page.getByRole('button', { name: buttonText }).click();
});

Then('I should be on the {string} page', async function (route: string) {
  const page = this.page as Page;
  await expect(page).toHaveURL(route);
});

Then('I should see the {string} title', async function (title: string) {
  const page = this.page as Page;
  await expect(page.getByText(title)).toBeVisible();
});

Given('I am on an unknown route {string}', async function (route: string) {
  const page = this.page as Page;
  await page.goto(route);
});

Then('I should be redirected to the home page', async function () {
  const page = this.page as Page;
  await expect(page).toHaveURL('/');
});
