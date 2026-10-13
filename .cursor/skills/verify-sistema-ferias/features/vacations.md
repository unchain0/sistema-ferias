# Vacations

Vacations (UI label `Férias`) lets an authenticated user manage vacation periods: acquisition range, usage range, automatic total days, and revenue deduction.

## Sub-features

- `vac-list` shows heading `Períodos de Férias` or empty state `Nenhum período de férias cadastrado`.
- `vac-search` filters by professional name via placeholder `Buscar por nome do profissional...`.
- `vac-create` creates a period through `Novo Período` with acquisition and usage dates.
- `vac-edit` updates dates via `Editar` → `Atualizar`.
- `vac-delete` removes a period via `Excluir` (browser confirm).
- `vac-concessive` shows the computed concessive period once acquisition dates are set.
- `vac-demo-block` confirms demo user mutations are rejected.

## How to get to it (user POV)

- Navbar link `Férias` → `/vacations`.
- Requires at least one professional for create (empty professionals shows `Nenhum profissional cadastrado` in the form path).
- Requires authenticated session.

## Driving it with Playwright

Preconditions:

- Authenticated as a **non-demo** throwaway user.
- At least one professional exists for that user (run professionals create first).
- Local filesystem DB.

- **Open list.** Go to `/vacations`. Expect heading `Períodos de Férias`.
- **Create.** Click `Novo Período`. Choose a professional in the select, set:
  - `Início Período Aquisitivo` / `Fim Período Aquisitivo`
  - `Início Período de Gozo` / `Fim Período de Gozo`
  Use ISO `YYYY-MM-DD` values in the date inputs (e.g. acquisition `2024-01-01`–`2024-12-31`, usage `2025-01-08`–`2025-01-19`). Click `Criar`.
- **Observe computed fields.** Total days and revenue deduction come from `lib/utils.ts` (`calculateVacationDays`, `calculateRevenueDeduction`).
- **Search.** Type the professional name into `Buscar por nome do profissional...`. Expect the new row.
- **Edit / delete.** Use `Editar` / `Excluir` with dialog accept, same pattern as professionals.
- **Proof.** Screenshot list-after-create into `$VERIFY_EVIDENCE_DIR/vacations-created.png`.

## Gotchas

- Demo user cannot mutate (same `lib/demo-protection.ts` gate as professionals).
- Date inputs need `YYYY-MM-DD`; the UI may display PT-BR elsewhere via `formatDateToPtBR`.
- Create requires an existing professional; otherwise the form path shows `Nenhum profissional cadastrado`.
- Delete uses `window.confirm`; accept it in Playwright.
- Do not assert fixed currency strings from seed-demo unless you seeded those exact rows — compute expectations from the professional's `monthlyRevenue` and day count.
