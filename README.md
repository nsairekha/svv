This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

---

## Testing Architecture

End-to-end (E2E) tests use **Cucumber** (Gherkin BDD) with **Playwright** (Chromium) and **TypeScript**.

### Stack

| Layer        | Technology |
|-------------|------------|
| Runner      | Cucumber (cucumber-js) |
| Language    | Gherkin (`.feature`) + TypeScript (step definitions) |
| Browser     | Playwright (Chromium) |
| Config      | `cucumber.js`, `tsconfig.cucumber.json`, `playwright.config.ts` |
| Reports     | JSON → HTML via `cucumber-html-reporter` |

### Flow

```
Feature files (.feature)  →  Cucumber  →  Step definitions (.ts)  →  Playwright  →  Browser (Chromium)
        ↑                                      ↑
   tests/features/                      tests/steps/
   tests/support/ (world, hooks)
```

- **Features** define scenarios in Given/When/Then.
- **Steps** implement those sentences with Playwright (navigate, fill, click, assert).
- **World** holds one shared `page` (and browser/context) per scenario.
- **Hooks** start the browser before each scenario and close it after.

### Folder structure

```
tests/
├── features/           # Gherkin feature files
│   └── login.feature
├── steps/              # TypeScript step definitions (Playwright)
│   └── login.steps.ts
└── support/            # Shared setup
    ├── world.ts        # Custom World (browser, context, page)
    └── hooks.ts        # Before: launch browser; After: close browser

reports/                # Generated (gitignored)
├── cucumber-report.json
└── cucumber-report.html

scripts/
└── generate-html-report.js   # JSON → HTML report
```

### Key config files

| File | Purpose |
|------|--------|
| `cucumber.js` | Loads ts-node, features, steps, support; writes JSON report to `reports/`. |
| `tsconfig.cucumber.json` | TypeScript config for Cucumber (CommonJS, includes `tests/**`). |
| `playwright.config.ts` | Base URL (e.g. `http://localhost:3000`), headless, viewport. |

---

## How to Run Tests

### Prerequisites

- Node.js and npm installed.
- App running at **http://localhost:3000** (e.g. `npm run dev` in another terminal).

### Commands

| Command | Description |
|--------|--------------|
| `npm run test:e2e` | Run E2E tests (Cucumber + Playwright). Writes `reports/cucumber-report.json`. |
| `npm run report:e2e` | Generate HTML report from the last run. Creates `reports/cucumber-report.html`. |
| `npm run test:e2e:report` | Run tests then generate the HTML report. |

### 1. Run E2E tests

```bash
# Terminal 1: start the app
npm run dev

# Terminal 2: run tests
npm run test:e2e
```

Optional: set base URL via env:

```bash
BASE_URL=http://localhost:3000 npm run test:e2e
```

### 2. Generate HTML report (after tests have run)

```bash
npm run report:e2e
```

Open `reports/cucumber-report.html` in a browser.

### 3. Run tests and generate report in one go

```bash
npm run test:e2e:report
```

### Adding or changing tests

1. **Scenarios** – Edit or add `.feature` files under `tests/features/` (Gherkin: Given/When/Then).
2. **Step definitions** – Implement or update steps in `tests/steps/*.ts` using Playwright (`this.page` from the shared World).
3. **Selectors** – Login flow uses `#email`, `#password`, `#login-btn`, `#error-msg`; align your app’s login page with these IDs or update the step file.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
