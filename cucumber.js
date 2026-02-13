// Configure Cucumber to load TypeScript step definitions via ts-node
// and to use the tests/features and tests/steps folders.

// Ensure ts-node uses the cucumber-specific tsconfig
process.env.TS_NODE_PROJECT = 'tsconfig.cucumber.json';

const fs = require('fs');
const path = require('path');

// Ensure reports directory exists for JSON output
const reportsDir = path.resolve(process.cwd(), 'reports');
try {
  fs.mkdirSync(reportsDir, { recursive: true });
} catch (e) {
  // ignore errors creating the directory
}

module.exports = {
  default: {
    require: ["ts-node/register", "tests/steps/**/*.ts"],
    paths: ["tests/features/**/*.feature"],
    // progress + pretty for readable console output, and a JSON report
    format: ["progress", "pretty", "json:reports/cucumber-report.json"]
  }
};
