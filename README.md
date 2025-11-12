
# Bright HR Employee UI — Playwright Tests

This project helps you quickly test the core employee flows in Bright HR, starting with the UI. The main scenario: open the app, log in, view the employee list, and add new employees using the UI form (including optional fields like phone, job title, and start date via calendar).

You can run the automated test in headed mode to watch the UI steps live, or use the HTML report for a summary.

## Quick start (UI-first)

1. Install dependencies and browser binaries:

```bash
npm ci
npx playwright install --with-deps
```

2. Run the test and watch the UI in action (headed mode):

```bash
APP_URL="https://sandbox-app.brighthr.com/lite" \
TEST_EMAIL="mranthonyakin@gmail.com" \
TEST_PASSWORD="@Abcd1234567" \
npx playwright test tests/employee.spec.ts --project=chromium --workers=1 --headed
```

You'll see the browser open, log in, and walk through the add-employee flow. The test fills out all required and optional fields, picks a start date from the calendar, and verifies the new employees appear in the list.

If you want a summary or to debug failures, use:

```bash
npx playwright show-report
```

## Environment variables
- `APP_URL` — base URL of the app under test (defaults to the sandbox URL above)
- `TEST_EMAIL`, `TEST_PASSWORD` — credentials for the test account

## Key files
- `tests/employee.spec.ts` — main test (uses page objects)
- `tests/pages/auth.page.ts` — login page object
- `tests/pages/employees.page.ts` — employee hub / add-employee page object
- `tests/fixtures/testData.ts` — random employee data generator
- `playwright.config.ts` — Playwright config and project definitions

## What the test does
- Logs in, opens Add employee dialog, fills required and optional fields (phone, start date, job title), saves, and checks the employee appears in the list
- Uses randomized data each run to avoid collisions
- Handles the custom DayPicker calendar for start date selection

## CI / CD

### GitHub Actions

Tests run automatically on push and pull requests to `main` branch.

**Setup:**
1. Go to your repository Settings → Secrets and variables → Actions
2. Add three secrets:
   - `APP_URL` — base URL of the app (e.g., `https://sandbox-app.brighthr.com/lite`) - Could be an Environment variable
   - `TEST_EMAIL` — test account email
   - `TEST_PASSWORD` — test account password
3. Push to `main` and the workflow will trigger

Workflow file: `.github/workflows/playwright.yml`
- Runs on Node 18 (ubuntu-latest)
- Installs dependencies and Playwright browsers
- Runs tests with 2 retries (configurable via `PLAYWRIGHT_RETRIES` env)
- Upload test results


