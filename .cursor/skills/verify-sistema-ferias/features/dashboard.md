# Dashboard

The dashboard is the default authenticated home. It shows total professionals, total vacation days, revenue impact, a monthly chart, and a per-professional impact table.

## Sub-features

- `dash-land` shows heading `Dashboard de Impacto Financeiro` after login.
- `dash-stats` renders cards `Total de Profissionais`, `Total de Dias de Férias`, and `Impacto no Faturamento`.
- `dash-charts` renders the `Férias por Mês` chart once data is loaded.
- `dash-table` lists professional revenue impacts.
- `dash-filter` updates data when `DateRangeFilter` quick filters change (e.g. `Todos os Períodos`).
- `dash-empty` handles zero-data accounts without crashing (new register user with no professionals).

## How to get to it (user POV)

- After a successful login, the app navigates to `/dashboard`.
- Navbar brand `Sistema de Férias` and nav link `Dashboard` both target `/dashboard`.
- Unauthenticated access is redirected to sign-in by `middleware.ts`.

## Driving it with Playwright

Preconditions:

- Authenticated session (throwaway user from register, or demo if local init-demo succeeded).
- `helpers/doctor.sh` was green before login.
- For non-empty stats, seed professionals/vacations as that user, or use demo data only when init-demo actually succeeded locally.

- **Land.** After login, expect URL `/dashboard` and heading `Dashboard de Impacto Financeiro`.
- **Stats.** Expect the three card titles above. For a brand-new user values may be `0` / `R$ 0,00`.
- **Wait for load.** Do not assert on `animate-pulse` skeletons; wait for the heading and cards to settle.
- **Nav round-trip.** Open `Profissionais`, then click `Dashboard`. Expect the same heading again.
- **Proof.** Screenshot the full dashboard into `$VERIFY_EVIDENCE_DIR/dashboard.png`. Optional: `curl -sS "$BASE/api/dashboard"` only works with a session cookie from the browser context — prefer UI proof.

## Gotchas

- First paint shows skeleton loaders; assert after data or empty state, not during pulse.
- Demo user is read-only; dashboard itself is read-only for everyone, so demo is fine **if** init-demo worked.
- If Supabase env points at a bad project, the UI can show `Erro ao carregar dados do dashboard`. Local proofs must keep Supabase unset.
- Date filter changes are asynchronous; wait for network idle or stable text before asserting.
