#!/usr/bin/env node
/**
 * Playwright proof: register → login → dashboard.
 * Env:
 *   VERIFY_BASE_URL       default http://127.0.0.1:5055
 *   VERIFY_EVIDENCE_DIR   required for screenshots
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);

function loadPlaywright() {
  const candidates = [
    () => require('playwright'),
    () => require(join(process.cwd(), 'node_modules', 'playwright')),
  ];
  for (const load of candidates) {
    try {
      return load();
    } catch {
      // try next
    }
  }
  console.error('drive-register: playwright not installed. run: npm install --no-save playwright');
  process.exit(2);
}

const { chromium } = loadPlaywright();

const base = (process.env.VERIFY_BASE_URL || 'http://127.0.0.1:5055').replace(/\/$/, '');
const evidenceDir = process.env.VERIFY_EVIDENCE_DIR;
if (!evidenceDir) {
  console.error('drive-register: set VERIFY_EVIDENCE_DIR');
  process.exit(2);
}
mkdirSync(evidenceDir, { recursive: true });

const stamp = Date.now();
const email = `verify+${stamp}@example.com`;
const password = 'senhateste123';
const name = 'Agente Verify';

const lines = [];
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  lines.push(line);
}

function redact(s) {
  return String(s).split(password).join('***');
}

async function main() {
  log(`base=${base}`);
  log(`email=${email}`);
  log('feature=register (features/register.md)');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    await page.goto(`${base}/register`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Criar Conta' }).waitFor({ timeout: 30000 });
    await page.screenshot({ path: join(evidenceDir, 'register-form.png'), fullPage: true });
    log('screenshot=register-form.png');

    await page.locator('input[type="text"]').first().fill(name);
    await page.locator('input[type="email"]').fill(email);
    const pw = page.locator('input[type="password"]');
    await pw.nth(0).fill(password);
    await pw.nth(1).fill(password);

    await page.getByRole('button', { name: 'Criar Conta' }).click();
    await page.waitForURL(/\/login/, { timeout: 30000 });
    log('register -> /login OK');
    await page.screenshot({ path: join(evidenceDir, 'register-after.png'), fullPage: true });

    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 30000 });
    await page.getByRole('heading', { name: 'Dashboard de Impacto Financeiro' }).waitFor({
      timeout: 30000,
    });
    log('login -> /dashboard OK');
    await page.screenshot({ path: join(evidenceDir, 'dashboard-after-login.png'), fullPage: true });

    const demoResp = await page.request.post(`${base}/api/auth/init-demo`);
    const demoStatus = demoResp.status();
    const demoBody = (await demoResp.text()).slice(0, 300);
    log(`init-demo status=${demoStatus} body=${demoBody.replace(/\s+/g, ' ')}`);
    log(
      demoStatus >= 400
        ? 'init-demo: FAIL observed (known issue #12 on production; local may differ)'
        : 'init-demo: OK on this local instance',
    );

    log('PROOF_RESULT=pass');
  } catch (err) {
    log(`PROOF_RESULT=fail error=${redact(err && err.stack ? err.stack : err)}`);
    try {
      await page.screenshot({ path: join(evidenceDir, 'failure.png'), fullPage: true });
    } catch {
      // ignore screenshot errors on failure path
    }
    throw err;
  } finally {
    writeFileSync(join(evidenceDir, 'drive-transcript.txt'), lines.map(redact).join('\n') + '\n');
    await browser.close();
  }
}

main().catch((err) => {
  console.error(redact(err && err.stack ? err.stack : err));
  process.exit(1);
});
