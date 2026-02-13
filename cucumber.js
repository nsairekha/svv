// Configure Cucumber to load TypeScript step definitions via ts-node
// and to use the tests/features and tests/steps folders.

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
    // World must load before hooks so setWorldConstructor runs first
    // Bootstrap (tests/register.js) sets TS_NODE_PROJECT and registers ts-node first
    require: [
      "tests/register.js",
      "tests/support/world.ts",
      "tests/support/hooks.ts",
      "tests/steps/**/*.ts",
    ],
    paths: ["tests/features/**/*.feature"],
    // progress + pretty for readable console output, and a JSON report
    format: ["progress", "json:reports/cucumber-report.json"]
  }
};
