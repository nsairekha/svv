/**
 * Bootstrap: set ts-node project and register before any .ts files are loaded.
 * Required for Cucumber + TypeScript on Node 18+.
 */
const path = require('path');
process.env.TS_NODE_PROJECT = path.resolve(process.cwd(), 'tsconfig.cucumber.json');
require('ts-node/register');
