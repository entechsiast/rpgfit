import { setWorldConstructor, Before, After } from '@cucumber/cucumber';
import { chromium, Browser, Page } from 'playwright';

interface CustomWorld {
  page: Page;
  browser: Browser;
}

class CustomWorld {
  page!: Page;
  browser!: Browser;
}

setWorldConstructor(CustomWorld as any);

Before(async function (this: CustomWorld) {
  this.browser = await chromium.launch({ headless: true });
  this.page = await this.browser.newPage();
});

After(async function (this: CustomWorld) {
  await this.browser.close();
});
