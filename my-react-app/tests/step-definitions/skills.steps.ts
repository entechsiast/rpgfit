import { Given, When, Then } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';

When('I navigate to the {string} tab', async function (tabName: string) {
  const page = this.page as Page;
  const tab = page.getByTestId(`tab-${tabName.toLowerCase()}`);
  await tab.click();
  await expect(tab).toHaveClass(/active/);
});

Then('I should see the {string} skill', async function (skillName: string) {
  const page = this.page as Page;
  await expect(page.getByTestId(`skill-${skillName.toLowerCase()}`)).toBeVisible();
});

When('I toggle the {string} skill', async function (skillName: string) {
  const page = this.page as Page;
  await page.getByTestId(`skill-${skillName.toLowerCase()}`).click();
});

Then('the {string} skill should be selected', async function (skillName: string) {
  const page = this.page as Page;
  const skill = page.getByTestId(`skill-${skillName.toLowerCase()}`);
  await expect(skill).toHaveClass(/selected/);
});

Then('the {string} skill should be unselected', async function (skillName: string) {
  const page = this.page as Page;
  const skill = page.getByTestId(`skill-${skillName.toLowerCase()}`);
  await expect(skill).not.toHaveClass(/selected/);
});

Given('the {string} skill is selected', async function (skillName: string) {
  const page = this.page as Page;
  const skill = page.getByTestId(`skill-${skillName.toLowerCase()}`);
  if (!(await skill.evaluate(el => el.classList.contains('selected')))) {
    await skill.click();
  }
});
