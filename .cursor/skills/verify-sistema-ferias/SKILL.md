---
name: verify-sistema-ferias
description: "Drive the Sistema de Férias Next.js web UI locally with curl and Playwright, prove a user-facing feature end to end, and capture screenshots plus a transcript. Use for /verify-sistema-ferias, verifying auth/register/dashboard/professionals/vacations, or when a change needs real browser evidence instead of unit-test confidence."
---

# Verify Sistema de Férias (web UI)

Sistema de Férias is a Next.js App Router vacation-management app. The primary user surface is the web UI on routes `/login`, `/register`, `/dashboard`, `/professionals`, and `/vacations`. Local data defaults to JSON files under `data/` when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are unset. With those set, `lib/db-switch.ts` routes through Supabase instead.

Safety rules:

- Never touch production, real credentials, prod databases, or real user data.
- Only drive an instance **you started** for this run. Default verification bind is `127.0.0.1:5055` so it does not collide with a human `npm run dev` on port 5000.
- Leave Supabase env vars unset for local filesystem mode. Never point verification at production Supabase.
- Generate `NEXTAUTH_SECRET` at runtime. Never commit `.env.local` or print secret values.

## Launch

Prerequisites once: `npm ci` at the repo root (Node `>=18`, see `.nvmrc`).

Start an isolated dev server (filesystem DB, no Supabase):

```bash
.cursor/skills/verify-sistema-ferias/helpers/launch.sh
```

What it does:

- Writes a throwaway `.env.local` with `NEXTAUTH_URL=http://127.0.0.1:${VERIFY_PORT:-5055}`, a runtime `NEXTAUTH_SECRET`, and **no** Supabase keys (so `lib/db-switch.ts` uses `lib/db.ts` JSON files under `data/`).
- Runs `npx next dev -H 127.0.0.1 -p ${VERIFY_PORT:-5055}` in the background.
- Records the PID at `/tmp/verify-sistema-ferias-${VERIFY_PORT:-5055}.pid` and logs at `/tmp/verify-sistema-ferias-${VERIFY_PORT:-5055}.log`.

Ready signal: `helpers/doctor.sh` exits 0. Teardown is in Cleanup (kill the PID file only).

One-shot launch → doctor → drive register → evidence → cleanup:

```bash
.cursor/skills/verify-sistema-ferias/helpers/run-proof.sh
```

## Doctor

Read-only. Run first whenever anything looks off:

```bash
.cursor/skills/verify-sistema-ferias/helpers/doctor.sh
# optional base URL:
.cursor/skills/verify-sistema-ferias/helpers/doctor.sh http://127.0.0.1:5055
```

Checks:

- TCP answers on the verification base URL.
- `GET /login` returns HTTP 200 and body contains `Sistema de Férias`.
- `GET /register` returns HTTP 200 and body contains `Criar Conta`.

Non-zero exit means the instance is not worth driving. Inspect the launch log under `/tmp/verify-sistema-ferias-*.log`.

## Drive

Harness: **Playwright** (Chromium) for the browser path, **curl** for read-only HTTP probes. Prefer stable text and roles over coordinates.

| Step | Handle |
|------|--------|
| Open login | `GET /login` — heading `Sistema de Férias` |
| Email / password | `input[type="email"]`, `input[type="password"]` (labels in `components/Input.tsx` are not `htmlFor`-wired) |
| Submit login | `getByRole('button', { name: 'Entrar' })` |
| Demo button | `getByRole('button', { name: 'Acessar Demonstração' })` → `POST /api/auth/init-demo` then credentials sign-in |
| Open register | `GET /register` or link `Cadastre-se` |
| Register fields | name / email / password / confirm via `input[type=...]` order on the form |
| Submit register | `getByRole('button', { name: 'Criar Conta' })` |
| Landed after login | URL `/dashboard` + heading `Dashboard de Impacto Financeiro` |
| Nav | links `Dashboard`, `Profissionais`, `Férias` in `components/Navbar.tsx` |
| Logout | button `Sair` |

Committed proof driver for the register → login → dashboard path:

```bash
.cursor/skills/verify-sistema-ferias/helpers/drive-register.mjs
```

Feature recipes live under `features/`. Read `features/README.md` first, then the matching file.

**Known failing journey (do not "fix" in this skill):** demo login via `POST /api/auth/init-demo` is broken in production (issue #12). Document failures; do not patch app code here. Prefer the register + credentials path for a green local proof. Local filesystem mode may still succeed for init-demo; treat production/Supabase demo as the known-fail case.

## Evidence

Proof standards:

- Exercise the real user path (form fill, button click, navigation), not internal setters.
- Capture the action and the resulting state: screenshot before/after plus command transcript and exit codes.
- Verify side effects: URL change, visible heading, and for mutations a second read of the list.
- Mocks only where a production boundary already isolates an external system. Local runs use the real JSON `data/` store with fake users only.

Where it goes (survives Cleanup):

- `.verify-evidence/<timestamp>/` at the repo root (gitignored), or
- `/tmp/verify-sistema-ferias-evidence/<timestamp>/` when the repo is not writable.

Each run writes at least `transcript.txt`, `PROOF.md`, and PNG screenshots. `helpers/run-proof.sh` sets `VERIFY_EVIDENCE_DIR` and creates the directory.

## Cleanup

Kill only what this run started (PID file), never by process name:

```bash
.cursor/skills/verify-sistema-ferias/helpers/cleanup.sh
```

What it removes:

- The `next dev` process from the PID file under `/tmp/verify-sistema-ferias-*.pid` (SIGTERM, then SIGKILL if needed).
- Launch log under `/tmp/verify-sistema-ferias-*.log`.
- Throwaway `.env.local` **only if** it carries the marker written by `launch.sh`.
- Optional local `data/` scratch when `VERIFY_WIPE_DATA=1` (default off so a failed iteration can be inspected).

What it never removes: `.verify-evidence/**` and `/tmp/verify-sistema-ferias-evidence/**`.

After cleanup, `doctor.sh` should fail (port closed). Confirm the evidence directory still exists.

Isolation: one verification instance per port. If the chosen port is already taken by something that is not yours, abort rather than hijacking it.

## Helpers

All under `.cursor/skills/verify-sistema-ferias/helpers/`; invocations are above.

| Script | Role |
|--------|------|
| `launch.sh` | Start isolated `next dev`, write marked `.env.local`, record PID/log |
| `doctor.sh` | Read-only readiness probe |
| `drive-register.mjs` | Playwright: register → login → dashboard screenshots |
| `run-proof.sh` | One-shot launch → doctor → drive → evidence → cleanup |
| `cleanup.sh` | Tear down PID/log/marked env only; keep evidence |

Make sure they are executable (`chmod +x helpers/*.sh helpers/*.mjs`).
