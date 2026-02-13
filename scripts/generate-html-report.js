/**
 * Converts Cucumber JSON report to HTML using cucumber-html-reporter.
 * Run after E2E tests: npm run report:e2e
 * Input:  reports/cucumber-report.json
 * Output: reports/cucumber-report.html
 */

const path = require('path');
const reporter = require('cucumber-html-reporter');

const reportsDir = path.resolve(process.cwd(), 'reports');
const jsonFile = path.join(reportsDir, 'cucumber-report.json');
const outputFile = path.join(reportsDir, 'cucumber-report.html');

const options = {
  theme: 'bootstrap',
  jsonFile,
  output: outputFile,
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: false,
  metadata: {
    'App Version': process.env.npm_package_version || '0.1.0',
    'Test Environment': process.env.NODE_ENV || 'test',
    'Browser': 'Chromium (Playwright)',
    'Platform': process.platform,
  },
  failedSummaryReport: true,
};

try {
  reporter.generate(options);
  console.log('HTML report generated:', outputFile);
} catch (err) {
  console.error('Report generation failed. Ensure tests have run and', jsonFile, 'exists.', err.message);
  process.exit(1);
}
