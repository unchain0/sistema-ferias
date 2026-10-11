---
name: verify-sistema-ferias
description: "Verification skill for sistema-ferias (unchain0/sistema-ferias). Drives the Next.js web app locally on port 5000, verifies user-facing features (auth/demo, professionals, vacation periods, dashboard), captures evidence, cleans up instances, and avoids corrupting shared sessions."
---

## Launch
`npm run dev` (binds 5000, 0.0.0.0). Ready when `http://localhost:5000` responds with HTTP 200 and the page title includes "Sistema de Controle de Férias". Teardown: kill the `next dev` process started by this run (not by name globally).

## Doctor
`curl -fs -o /dev/null http://localhost:5000` plus response body contains "Sistema". If missing, instance not ready.

## Drive
Use browser/CDP or curl. For quick verification: open `http://localhost:5000`, click "Acessar Demonstração" (demo mode, no real secrets needed). Exercise: view dashboard, open professionals list. Evidence: screenshot and curl transcript saved to `.cursor/skills/verify-sistema-ferias/evidence/`.

## Evidence
Capture screenshot (`evidence/drive-<timestamp>.png`) and terminal transcript (`evidence/transcript-<timestamp>.txt`) for each drive. Proof standard: real user path (demo login => dashboard => feature), not test endpoints. Mock only at auth boundary; demo mode skips persistent mutations and uses preloaded data.

## Cleanup
Kill the `next` process launched by this verification run. Remove scratch instance data only; never delete evidence in `.cursor/skills/verify-sistema-ferias/evidence/`.

## Helpers
None required; harness uses `curl`/`npx playwright` if available. No secret literals: auth uses runtime demo mode (`demo@sistema-ferias.com` / `demo123`) or generated `.env.local` with `openssl rand -base64 32`; never commit secrets.

## Isolation
Port 5000 is shared; only one instance should run at a time. If another instance owns 5000, abort and report rather than corrupting session.
