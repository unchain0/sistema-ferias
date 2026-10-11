# Professionals

Professionals CRUD lets a logged-in user manage professional records (name, client manager, monthly revenue).

## Sub-features

- `prof-list` views the list of professionals.
- `prof-create` creates a new professional.
- `prof-edit` edits an existing professional.
- `prof-delete` deletes a professional.
- `prof-search` searches/filter professionals by name or client manager.

## How to get to it (user POV)

- From the dashboard, click the "Novo Profissional" (New Professional) button in the header.
- From the main navigation, select the "Profissionais" route.
- Search bar at the top of the professionals page filters by name or client manager.

## Driving it with Playwright

Preconditions:

- App is running at `http://127.0.0.1:5000`.
- User is authenticated (demo session or fresh account).
- Demo data is seeded via `POST /api/auth/init-demo`.
- Professionals list is visible (at least one professional exists, or the "Nenhum profissional cadastrado" empty state is the starting point).

- **Open list.** Navigate to the professionals page (`/professionals`). The table of professionals is visible, or the empty state "Nenhum profissional cadastrado" is shown.
- **Search.** Focus the search input, type `João`, and verify the list filters to show only professionals matching `João` in name or client manager. Clear the search to restore the full list.
- **Create new.** Click "Novo Profissional". The form fields "Nome do Profissional", "Gestor no Cliente", "Faturamento Mensal (R$)" are visible. Fill in:
  - Name: `Profissional Teste Automação`
  - Client Manager: `Automator Fulano`
  - Monthly Revenue: `9999.99`
- **Submit.** Click "Criar". The new professional appears in the list.
- **Proof.** Capture screenshot at `artifacts/professionals/created.png` showing the new entry in the list. Capture ARIA snapshot at `artifacts/professionals/created.aria.txt`.
- **Edit.** Hover over the new professional row, click "Editar". Modify the name to `Profissional Teste Atualizado`. Click "Atualizar". Verify the list shows the updated name.
- **Delete.** Hover over the updated professional, click "Excluir". Confirm the deletion dialog. Verify the professional is removed from the list.
- **Empty state.** If starting with no professionals, click "Novo Profissional", create one, verify it appears, then delete it to return to the empty state.

## Gotchas

- The search input supports debounced filtering — wait for the list to update after typing, do not assert immediately.
- Editable fields trim whitespace on save; verify the rendered value, not the raw input value.
- The "Excluir" button triggers a JavaScript confirmation dialog — the verification must click "OK" or dismiss the dialog appropriately.
- If the demo account is used, modifications are blocked by `demo-protection` (403). Use a freshly registered account for create/edit/delete flows, or test only the list-view and search behaviors with the demo account.
- Monthly revenue input accepts decimal values with `step=0.01`; commas and periods are locale-dependent — use the format expected by the API (dot as decimal separator).