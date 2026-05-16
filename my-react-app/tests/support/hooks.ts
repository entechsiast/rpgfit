import { spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
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

const LOCK_FILE = join(__dirname, '..', '.devserver.lock');

const isProcessAlive = (pid: number): boolean => {
  try {
    spawn('taskkill', ['/PID', String(pid), '/F'], { shell: true });
    return true;
  } catch {
    return false;
  }
};

Before(async function (this: CustomWorld) {
  // Check if global-setup already started the server
  if (existsSync(LOCK_FILE)) {
    const pid = Number(readFileSync(LOCK_FILE).toString().trim());
    if (pid && isProcessAlive(pid)) {
      console.log('Dev server is already running (PID ' + pid + '), skipping server start');
    } else {
      console.warn('Dev server lock file exists but process is not running (stale lock)');
    }
  }

  this.browser = await chromium.launch({ headless: true });
  const context = await this.browser.newContext({ baseURL: 'http://localhost:3000' });
  this.page = await context.newPage();
});

After(async function (this: CustomWorld) {
  if (this.page) await this.page.close();
  if (this.browser) await this.browser.close();
});
