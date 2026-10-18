'use strict';

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-ci-'));
const npmrc = path.join(tmpDir, '.npmrc');
fs.writeFileSync(npmrc, 'fund=false\n');

const audit = spawnSync('npm', ['audit', '--json'], {
  cwd: root,
  encoding: 'utf8',
  env: {
    ...process.env,
    npm_config_userconfig: npmrc,
    npm_config_globalconfig: npmrc,
    npm_config_allow_scripts: 'false',
  },
  maxBuffer: 20 * 1024 * 1024,
});

let report;
try {
  report = JSON.parse(audit.stdout || '{}');
} catch (error) {
  console.error('Failed to parse npm audit JSON');
  console.error(audit.stderr || String(error));
  process.exit(1);
}

const allowlist = new Set(
  JSON.parse(fs.readFileSync(path.join(root, '.github/audit-ci.json'), 'utf8')).allowlist || []
);

const vulns = report.vulnerabilities || {};
const failing = [];

for (const [name, entry] of Object.entries(vulns)) {
  if (entry.severity !== 'high' && entry.severity !== 'critical') {
    continue;
  }

  const advisories = [];
  for (const item of entry.via || []) {
    if (item && typeof item === 'object' && typeof item.url === 'string') {
      const id = item.url.split('/').pop();
      if (id) advisories.push(id);
    }
  }

  if (advisories.length === 0) {
    // Parent node that only aggregates child advisories.
    continue;
  }

  const unlisted = advisories.filter((id) => !allowlist.has(id));
  if (unlisted.length > 0) {
    failing.push({ name, severity: entry.severity, advisories: unlisted });
  }
}

if (failing.length > 0) {
  console.error('High/critical vulnerabilities not allowlisted:');
  console.error(JSON.stringify(failing, null, 2));
  process.exit(1);
}

console.log('Passed npm security audit (high/critical allowlist check).');
process.exit(0);
