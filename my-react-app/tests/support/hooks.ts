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
  const context = await this.browser.newContext({ baseURL: 'http://localhost:3000' });
  this.page = await context.newPage();
});

After(async function (this: CustomWorld) {
  if (this.page) await this.page.close();
  if (this.browser) await this.browser.close();
});
