import { test, expect } from '@playwright/test';
import { AuthPage } from './pages/auth.page';
import { EmployeesPage } from './pages/employees.page';
import { generateEmployees } from './fixtures/testData';

const APP_URL = process.env.APP_URL || 'https://sandbox-app.brighthr.com/lite';
const TEST_EMAIL = process.env.TEST_EMAIL || 'mranthonyakin@live.co.uk';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Abcdef@12345';

test.describe('Employees flow', () => {
    test('login, add two employees, verify they appear', async ({ page }) => {
        const auth = new AuthPage(page);
        const employees = new EmployeesPage(page);

        // Generate 2 random employees data for this test run
        const [e1, e2] = generateEmployees(2);
        console.log(`[Test] Generated employees: ${e1.first} ${e1.last}, ${e2.first} ${e2.last}`);

        await auth.goto(APP_URL);
        await auth.login(TEST_EMAIL, TEST_PASSWORD);

        // Proper wait for CI environment
        await page.waitForURL((url) => !url.href.includes('/callback'), {
            timeout: 30000,
            waitUntil: 'networkidle'
        });

        await page.waitForLoadState('domcontentloaded');

        // Increase timeout for CI
        await expect(employees.navEmployees).toBeVisible({ timeout: 20000 });


        await employees.navigate();

        await employees.addEmployee(e1.first, e1.last, e1.email);
        // After saving the first employee, click 'Add another employee' button to test that flow
        const addAnotherButton = page.locator('button:has-text("Add another employee")');
        await expect(addAnotherButton).toBeVisible({ timeout: 5000 });
        await addAnotherButton.click();
        await employees.addEmployee(e2.first, e2.last, e2.email);

        // Close the success modal before checking the employee list
        await employees.closeModal();

        expect(await employees.hasEmployee(e1.first, e1.last)).toBeTruthy();
        expect(await employees.hasEmployee(e2.first, e2.last)).toBeTruthy();
    });
});
