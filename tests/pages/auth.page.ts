import { Page, expect } from '@playwright/test';

export class AuthPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async goto(url: string) {
        await this.page.goto(url, { waitUntil: 'domcontentloaded' });
        // Wait for the header to fully render before attempting to click Log in link
        await expect(this.page.locator('a:has-text("Log in"), a:has-text("Log In"), a:has-text("Sign up")')).toBeVisible({ timeout: 10000 });
        // Click the header "Log in" link to navigate from signup page to login page
        const loginLink = this.page.locator('a:has-text("Log in"), a:has-text("Log In")').first();
        if (await loginLink.count() > 0) {
            await loginLink.click();
            // Wait for login form inputs to appear (#username, #password)
            await expect(this.page.locator('#username, input[type="email"]')).toBeVisible({ timeout: 15000 });
        }
        // Ensure email input is visible before proceeding
        await expect(this.page.locator('#username, input[type="email"]')).toBeVisible({ timeout: 10000 });
    }

    async login(email: string, password: string) {
        // Prefer explicit ids used by the app: #username and #password. Fall back to type/name selectors.
        const emailLocator = this.page.locator('#username, input[type="email"], input[name*="email" i], input[id*="email" i], [data-testid="email"]').first();
        const passwordLocator = this.page.locator('#password, input[type="password"], input[name*="password" i], input[id*="password" i], [data-testid="password"]').first();
        const submitButton = this.page.locator('button[type="submit"], button:has-text("Log in"), button:has-text("Sign in"), button:has-text("Login")').first();

        await expect(emailLocator).toBeVisible({ timeout: 10000 });
        await emailLocator.fill(email);

        await expect(passwordLocator).toBeVisible({ timeout: 10000 });
        await passwordLocator.fill(password);

        await submitButton.click();
    }
}
