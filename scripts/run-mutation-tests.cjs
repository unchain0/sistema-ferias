'use strict';

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const files = [
  'test/utils.test.ts',
  'test/uuid-v7.test.ts',
  'test/input-validation.test.ts',
  'test/storage-errors.test.ts',
  'test/handle-demo-error.test.ts',
];

const result = spawnSync(
  process.execPath,
  [require.resolve('tsx/cli'), '--test', ...files],
  {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  }
);

process.exit(result.status === null ? 1 : result.status);
