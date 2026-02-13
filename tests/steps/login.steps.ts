import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import assert from 'assert';
import type { CustomWorld } from '../support/world';

setDefaultTimeout(20000);

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const SELECTORS = {
  email: '[data-testid="login-email"]',
  password: '[data-testid="login-password"]',
  loginButton: '[data-testid="login-submit"]',
  errorMessage: '[data-testid="login-error"]',
};

// --- Given ---

Given('I am on the login page', async function (this: CustomWorld) {
  await this.page!.goto(`${BASE_URL}/auth/login`);
  await this.page!.waitForLoadState('domcontentloaded');
});

// --- When ---

When('I enter email {string} and password {string}', async function (this: CustomWorld, email: string, password: string) {
  const e2eEmail = process.env.E2E_TEST_EMAIL || email;
  const e2ePassword = process.env.E2E_TEST_PASSWORD || password;
  await this.page!.fill(SELECTORS.email, e2eEmail);
  await this.page!.fill(SELECTORS.password, e2ePassword);
});

When('I submit the login form', async function (this: CustomWorld) {
  await this.page!.click(SELECTORS.loginButton);
  // Allow time for navigation or error message to appear
  await this.page!.waitForTimeout(1500);
});

When('I leave email and password empty', async function (this: CustomWorld) {
  await this.page!.fill(SELECTORS.email, '');
  await this.page!.fill(SELECTORS.password, '');
});

When('I enter an email of 256 characters and a password of 256 characters', async function (this: CustomWorld) {
  const longString = 'a'.repeat(256);
  await this.page!.fill(SELECTORS.email, longString);
  await this.page!.fill(SELECTORS.password, longString);
});

// --- Then ---

Then('I should be redirected to the dashboard', async function (this: CustomWorld) {
  // Next.js client-side navigation may not fire 'load'; use 'domcontentloaded'
  await this.page!.waitForURL(/\/dashboard/, { timeout: 10000, waitUntil: 'domcontentloaded' });
  const url = this.page!.url();
  assert.ok(
    url.includes('/dashboard'),
    `Expected redirect to dashboard but got: ${url}`
  );
});

Then('I should see that I am logged in', async function (this: CustomWorld) {
  const url = this.page!.url();
  assert.ok(
    !url.includes('/auth/login'),
    'Expected to be logged in (not on login page)'
  );
  const dashboardOrProfile = await this.page!.locator('[href="/dashboard"], [href="/profile"], [data-testid="user-menu"]').first().isVisible().catch(() => false);
  assert.ok(
    url.includes('/dashboard') || dashboardOrProfile,
    'Expected to see logged-in state (dashboard URL or user profile/menu)'
  );
});

Then('I should remain on the login page', async function (this: CustomWorld) {
  const url = this.page!.url();
  assert.ok(
    url.includes('/auth/login'),
    `Expected to remain on login page but got: ${url}`
  );
});

Then('I should see an error message about invalid credentials', async function (this: CustomWorld) {
  const errorEl = this.page!.locator(SELECTORS.errorMessage);
  await errorEl.waitFor({ state: 'visible', timeout: 5000 });
  const text = await errorEl.textContent();
  assert.ok(
    text && text.length > 0,
    'Expected error message element to contain text'
  );
});

Then('I should see validation errors for email and password', async function (this: CustomWorld) {
  const url = this.page!.url();
  assert.ok(url.includes('/auth/login'), 'Expected to stay on login page');
  const errorVisible = await this.page!.locator(SELECTORS.errorMessage).isVisible().catch(() => false);
  assert.ok(
    errorVisible,
    'Expected validation errors (error message) to be visible'
  );
});

Then('the form should handle the long inputs without crashing', async function (this: CustomWorld) {
  const url = this.page!.url();
  assert.ok(
    url.includes('/auth/login') || url.includes('/dashboard'),
    `Expected page to be stable (login or dashboard), got: ${url}`
  );
  const loginButtonVisible = await this.page!.locator(SELECTORS.loginButton).isVisible();
  assert.ok(loginButtonVisible, 'Expected login form to still be visible (no crash)');
});

Then('I should see an error or no unauthorized access', async function (this: CustomWorld) {
  const url = this.page!.url();
  const onLogin = url.includes('/auth/login');
  const hasError = await this.page!.locator(SELECTORS.errorMessage).isVisible().catch(() => false);
  assert.ok(
    onLogin || hasError,
    'Expected to remain on login or see error (no unauthorized access)'
  );
});
