import { Page, Locator, expect } from '@playwright/test';

export class EmployeesPage {
    readonly page: Page;
    readonly navEmployees: Locator;
    readonly addButton: Locator;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly emailInput: Locator;
    readonly saveButton: Locator;

    constructor(page: Page) {
        this.page = page;
        // Target the sidebar employees link 
        this.navEmployees = page.locator('a[data-e2e="employees"], a[href="/employee-hub"]').first();
        // Target "Add employee"
        this.addButton = page.locator('button:has-text("Add employee")').first();

        // Common form fields
        this.firstNameInput = page.getByLabel(/first name/i);
        this.lastNameInput = page.getByLabel(/last name/i);
        this.emailInput = page.getByRole('textbox', { name: /email/i });
        // Target the submit button in the form modal (has type="submit", not the "Add employee" button)
        this.saveButton = page.getByRole('button', { name: /save|save new employee/i });
    }

    /**
     * Close visible success/modal dialog by clicking a close button inside it.
     */
    async closeModal() {
        const modal = this.page.locator('[role="dialog"]');
        if ((await modal.count()) === 0) return;

        //'Close modal' button inside the dialog
        const closeButton = modal.locator('button[aria-label="Close modal"]').first();
        if (await closeButton.count() > 0) {
            await closeButton.click();

            // Wait for modal to be removed/hidden
            try {
                await expect(this.page.locator('[role="dialog"]'))
                    .toHaveCount(0, { timeout: 5000 });
            } catch (err) {
                // Log error but don't fail
                console.warn('Dialogs still present after 5s, continuing anyway');
            }
            return;
        }
    }


    async navigate() {
        await this.navEmployees.click();
        // Wait for the page to load after clicking employees link
        await this.page.waitForLoadState('networkidle');
        // Wait for Add employee button to be visible
        await expect(this.addButton).toBeVisible({ timeout: 10000 });
    }

    async openAddDialog() {
        // Close any existing modal first (click outside or find close button)
        const modal = this.page.locator('[role="dialog"]');
        const modalCount = await modal.count();
        if (modalCount > 0) {
            const closeButton = modal.locator('button[aria-label="Close modal"]').first();
            try {
                await closeButton.first().click({ timeout: 2000 });
                // Wait for modal to actually disappear from the DOM
                await this.page.waitForFunction(() => document.querySelectorAll('[role="dialog"]').length === 0, { timeout: 5000 });
            } catch (e) {
                // Leave a warning if modal cannot be closed
                console.warn('[EmployeesPage] Could not close modal gracefully');
            }
        }
        // Now click Add employee button
        await this.addButton.click();
        await expect(this.firstNameInput).toBeVisible({ timeout: 10000 });
    }

    async addEmployee(firstName: string, lastName: string, email: string) {
        await this.openAddDialog();

        await this.firstNameInput.fill(firstName);
        await this.lastNameInput.fill(lastName);
        await this.emailInput.fill(email);

        // Fill optional fields
        // Phone number
        const phoneInput = this.page.getByLabel(/phone number/i);
        if (await phoneInput.count() > 0) {
            await phoneInput.fill(`07${Math.floor(100000000 + Math.random() * 899999999)}`);
        }
        // Start date (choose a date in the following week using the calendar dropdown)
        // The startDate field is not a standard input but uses id="startDate" with a custom calendar component
        const startDateElement = this.page.locator('#startDate');
        if (await startDateElement.count() > 0) {
            await startDateElement.click();
            // Wait for the DayPicker calendar to appear
            await expect(this.page.locator('.DayPicker')).toBeVisible({ timeout: 5000 });
            // Pick a date 3-7 days from today
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + 3 + Math.floor(Math.random() * 5));
            const day = targetDate.getDate();
            const dayStr = String(day);
            // The days are in divs with class "DayPicker-Day" containing a DayPicker-Day-Number with the day text
            const dayElements = this.page.locator('.DayPicker-Day');
            const dayWithNumber = await this.page.evaluate((dayNum) => {
                const days = document.querySelectorAll('.DayPicker-Day');
                for (const dayEl of days) {
                    const numberEl = dayEl.querySelector('.DayPicker-Day-Number');
                    if (numberEl && (numberEl as any).innerText?.trim() === dayNum) {
                        return true;
                    }
                }
                return false;
            }, dayStr);
            if (dayWithNumber) {
                // Find and click the day element
                const daySelector = this.page.locator('.DayPicker-Day', { has: this.page.locator(`.DayPicker-Day-Number:has-text("${dayStr}")`) });
                await daySelector.first().click();
            } else {
                // Log available day numbers for debugging
                const availableDays = await this.page.evaluate(() => {
                    const days = document.querySelectorAll('.DayPicker-Day-Number');
                    return Array.from(days).map(d => (d as any).innerText?.trim()).filter(Boolean);
                });
                throw new Error(`Could not find day "${dayStr}" in calendar. Available: ${availableDays.join(', ')}`);
            }
        }
        // Job title
        const jobTitleInput = this.page.getByLabel(/job title/i);
        if (await jobTitleInput.count() > 0) {
            await jobTitleInput.fill('Senior QA Engineer');
        }

        await this.saveButton.click();
        // After saving, the success modal appears with "Add another employee" button
        // Wait for the success modal and button to be visible
        await expect(this.page.locator('button:has-text("Add another employee")')).toBeVisible({ timeout: 20000 });
        // Wait for the list to update with the new employee
        await this.page.waitForLoadState('networkidle');
    }

    async hasEmployee(firstName: string, lastName: string): Promise<boolean> {
        // Wait for the employee list to be displayed
        await this.page.waitForLoadState('domcontentloaded');

        // Look for the employee
        const employeeLocator = this.page.locator(`text=${firstName} ${lastName}`).first();

        try {
            await employeeLocator.waitFor({ state: 'visible', timeout: 10000 });
            return await employeeLocator.isVisible();
        } catch {
            return false;
        }
    }
}
