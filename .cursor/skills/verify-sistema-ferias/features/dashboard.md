# Dashboard

The dashboard displays the financial impact of professional vacations: total professionals, total vacation days, and revenue impact. It is the default landing view for authenticated users.

## Sub-features

- `dash-stats` displays the three statistic cards (total professionals, total days, revenue impact).
- `dash-charts` renders the monthly vacation trends chart.
- `dash-table` renders the professional impacts table with per-professional revenue deductions.
- `dash-empty` shows the empty state when no data is available.

## How to get to it (user POV)

- After logging in, the dashboard is the default landing page.
- The navbar brand "Sistema de Férias" returns to the dashboard when clicked.

## Driving it with Playwright

Preconditions:

- App is running at `http://127.0.0.1:5000`.
- User is authenticated (demo session or fresh account).
- Demo data is seeded via `POST /api/auth/init-demo` (creates 12 professionals and 42 vacation periods).
- The dashboard API endpoints return expected data for the demo user.

- **Land on dashboard.** Navigate to `/` or `/dashboard`. The page header "Dashboard de Impacto Financeiro" is visible.
- **Stat cards.** Verify the three statistic cards are present:
  - "Total de Profissionais" shows a value >= 1 (demo seed has 12).
  - "Total de Dias de Férias" shows a value >= 1 (demo seed has 42 vacation periods with varying days).
  - "Impacto no Faturamento" shows a currency value (R$) greater than zero.
- **Charts.** The monthly vacation trends chart is rendered (high-resolution canvas or SVG). Verify the chart element is present and not the "pulse" skeleton loader.
- **Table.** The professional impacts table is rendered with rows for each professional. Each row shows the professional name, client manager, and revenue impact.
- **Search/filter.** Use the DateRangeFilter to select a date range. The chart and table should update to reflect only the vacations within the selected range.
- **Proof.** Capture screenshot at `artifacts/dashboard/success.png` showing the full dashboard with stats, chart, and table visible. Capture ARIA snapshot at `artifacts/dashboard/success.aria.txt`.
- **Reload.** Reload the page. Verify the dashboard persists and the user remains logged in (session persistence).

## Gotchas

- On first load, the dashboard shows skeleton loaders (`animate-pulse`) while data fetches. Wait for the actual data to appear before asserting — do not judge success on the pulse loading state.
- If `NEXTAUTH_SECRET` is missing, the app may redirect to login or fail to load session — always verify the baseline env vars.
- The DateRangeFilter debounces updates — wait for the chart/table to stabilize after a range change, not immediately.
- The demo account permits only read-only operations. All dashboard features are read-only with the demo account, which is the intended use case.
- If the Supabase connection is misconfigured, the dashboard will show "Erro ao carregar dados do dashboard" — the baseline check must verify the Supabase keys are valid before driving the dashboard.