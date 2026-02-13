import { Before, After } from '@cucumber/cucumber';
import { chromium } from 'playwright';
import type { CustomWorld } from './world';

Before(async function (this: CustomWorld) {
  this.browser = await chromium.launch({ headless: true });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

After(async function (this: CustomWorld) {
  if (this.page) await this.page.close();
  if (this.context) await this.context.close();
  if (this.browser) await this.browser.close();
});
