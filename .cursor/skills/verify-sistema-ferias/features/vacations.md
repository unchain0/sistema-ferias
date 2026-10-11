# Vacations

Vacation periods CRUD lets a logged-in user manage vacation acquisition and usage periods, with automatic total days and revenue deduction calculations.

## Sub-features

- `vac-list` views the list of vacation periods.
- `vac-create` creates a new vacation period.
- `vac-edit` edits an existing vacation period.
- `vac-delete` deletes a vacation period.
- `vac-search` searches vacation periods by professional name.
- `vac-concessive` displays the computed concessive period and total days.

## How to get to it (user POV)

- From the dashboard, click the "Novo Período" (New Period) button in the header.
- From the main navigation, select the "Períodos de Férias" route.
- Search bar at the top filters by professional name.

## Driving it with Playwright

Preconditions:

- App is running at `http://127.0.0.1:5000`.
- User is authenticated (demo session or fresh account).
- Demo data is seeded via `POST /api/auth/init-demo`.
- At least one professional exists in the system (the demo seed creates 12 professionals).

- **Open list.** Navigate to the vacations page (`/vacations`). The list of vacation periods is visible, or the empty state "Nenhum período de férias cadastrado" is shown (if starting fresh).
- **Search by professional.** Focus the search input, type the name of a professional (e.g., `João Silva`), and verify the list filters to show only vacation periods for that professional. Clear the search to restore the full list.
- **Create new.** Click "Novo Período". The form fields are displayed:
  - Profissional: dropdown with available professionals.
  - Início Período Aquisitivo: date input (format `YYYY-MM-DD`).
  - Fim Período Aquisitivo: date input.
  - Início Período de Gozo: date input.
  - Fim Período de Gozo: date input.
  - The computed "Período Concessivo" line appears below the form once both acquisition dates are set.
- Fill the form with:
  - Professional: select the first available professional (e.g., `João Silva`).
  - Aquisição Start: `2024-01-01`.
  - Aquisição End: `2024-12-31`.
  - Gozo Start: `2025-01-08`.
  - Gozo End: `2025-01-19`.
- **Submit.** Click "Criar". The new vacation period appears in the list.
- **Proof.** Capture screenshot at `artifacts/vacations/created.png` showing the new entry. Capture ARIA snapshot at `artifacts/vacations/created.aria.txt`.
- **Verify computed values.** After creation, verify the "Total de Dias" shows `12 dias` and the "Abatimento" shows `R$ 6000,00` (matching the demo seed data logic).
- **Edit.** Hover over the new vacation period, click "Editar". Modify the gozo period to `2025-01-10` to `2025-01-20` (11 days). Click "Atualizar". Verify the "Total de Dias" updates to reflect the new period.
- **Delete.** Hover over the updated vacation period, click "Excluir". Confirm the deletion. Verify the professional is removed from the list.
- **Empty state return.** If starting with demo data, after deleting all vacation periods, verify the empty state "Nenhum período de férias cadastrado" appears.

## Gotchas

- Date inputs must use the `YYYY-MM-DD` format; the UI displays PT-BR format but the API expects ISO.
- The "Período Concessivo" is computed from the acquisition start/end dates and displayed as a read-only line — it is not an input field.
- Total days are calculated as `(usageEndDate - usageStartDate)` in days, truncated to whole days.
- Revenue deduction is computed as `(monthlyRevenue / 30) * totalDays` — verify the displayed value matches the professional's monthly revenue.
- Search by professional name is case-insensitive and matches against the professional's name, not the vacation period ID.
- The demo account blocks modifications (403). For create/edit/delete, use a freshly registered account, or test only list/view/search with the demo account.
- If the acquisition end date is before the start date, the form should reject the submission or swap the dates — verify the behavior.