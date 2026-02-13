import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import assert from 'assert';
import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';

setDefaultTimeout(20000);

const BASE = process.env.BASE_URL || 'http://localhost:3000';

Given('I am on the login page', async function () {
  if (!this.browser) {
    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }
  await this.page.goto(`${BASE}/auth/login`);
});

When('I fill in valid credentials and submit', async function () {
  // NOTE: Adjust selectors to match your app's login form
  await this.page.fill('input[name="email"]', process.env.E2E_TEST_EMAIL || 'test@example.com');
  await this.page.fill('input[name="password"]', process.env.E2E_TEST_PASSWORD || 'password');
  await Promise.all([
    this.page.waitForNavigation({ waitUntil: 'networkidle' }),
    this.page.click('button[type="submit"]'),
  ]);
});

Then('I should be redirected to the dashboard', async function () {
  // Adjust path if your app redirects elsewhere after login
  const url = this.page.url();
  const ok = url.includes('/dashboard');
  assert.ok(ok, `Expected current URL to include "/dashboard" but found "${url}"`);
});
