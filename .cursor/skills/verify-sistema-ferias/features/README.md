# Sistema de Férias verification map

This directory is the maintained source for verifying user-facing behavior of Sistema de Férias. Read this index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch via `.cursor/skills/verify-sistema-ferias/helpers/launch.sh` (default `http://127.0.0.1:5055`).
- Leave `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` unset so `lib/db-switch.ts` uses local JSON under `data/`.
- `NEXTAUTH_URL` must match the verification base URL; `NEXTAUTH_SECRET` must be set (launch.sh generates both).
- Run `helpers/doctor.sh` and require HTTP 200 on `/login` with body text `Sistema de Férias`.
- Never drive an instance you did not start. Never use production credentials or production Supabase.
- Use throwaway emails like `verify+$EPOCH@example.com` only.

## Driving conventions

- Start every recipe from a fresh browser context unless the file says otherwise.
- Prefer role + accessible name, then input type/placeholder. `components/Input.tsx` labels are visual only (no `htmlFor`), so `input[type="email"]` / `input[type="password"]` are the stable handles.
- Treat every command as literal.
- Browser actions go through Playwright Chromium (`helpers/drive-register.mjs` is the template).
- HTTP probes use curl against the verification base URL only.
- Restore or discard throwaway users/data after mutations. Never delete proof artifacts during cleanup.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes screenshots with the app identity visible (`Sistema de Férias` or the page heading).
- HTTP proof includes the command, status code, and a short body excerpt (no secrets).
- Mutation proof includes a second read of the list or dashboard value.
- Record the feature file and entry point with every artifact under `.verify-evidence/<timestamp>/`.
- Report an unreachable path with the attempted command and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with Playwright` starts with `Preconditions:` and pairs each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

## Features

- [Login / session](./login.md) covers credentials login, demo button (known failing on production init-demo, issue #12), failure, and session persist.
- [Register](./register.md) covers account creation and validation errors (primary green local proof path).
- [Dashboard](./dashboard.md) covers stats, charts, table, and empty/error states after auth.
- [Professionals](./professionals.md) covers list/search and CRUD (mutations blocked for demo user).
- [Vacations](./vacations.md) covers list/search and CRUD for vacation periods (mutations blocked for demo user).
