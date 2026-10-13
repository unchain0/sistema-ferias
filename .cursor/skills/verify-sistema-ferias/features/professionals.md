# Professionals

Professionals lets an authenticated user list, search, create, edit, and delete professional records (name, client manager, monthly revenue).

## Sub-features

- `prof-list` shows the professionals page heading `Profissionais` or empty state `Nenhum profissional cadastrado`.
- `prof-search` filters by name or client manager via placeholder `Buscar por nome ou gestor...`.
- `prof-create` creates a row through `Novo Profissional` → fields → `Criar`.
- `prof-edit` updates a row via `Editar` → `Atualizar`.
- `prof-delete` removes a row via `Excluir` (browser confirm).
- `prof-demo-block` confirms demo user mutations return protected errors (403 via `lib/demo-protection.ts`).

## How to get to it (user POV)

- Navbar link `Profissionais` → `/professionals`.
- From the dashboard header actions when present, use `Novo Profissional`.
- Requires an authenticated non-expired session.

## Driving it with Playwright

Preconditions:

- Authenticated as a **non-demo** throwaway user for create/edit/delete.
- `helpers/doctor.sh` green before auth.
- Local filesystem DB.

- **Open list.** Navigate to `/professionals`. Expect heading `Profissionais`.
- **Create.** Click `Novo Profissional`. Fill `Nome do Profissional` input (order: name, gestor, revenue — use the three text/number inputs in the form), e.g. name `Profissional Verify`, gestor `Gestor Verify`, revenue `9999.99`. Click `Criar`. Expect the name visible in the list.
- **Search.** Type `Verify` into the search box with placeholder `Buscar por nome ou gestor...`. Expect the new row; clear search to restore.
- **Edit.** Click `Editar` on the row, change name to `Profissional Verify Editado`, click `Atualizar`. Expect updated text.
- **Delete.** Click `Excluir`, accept the confirm dialog. Expect the name gone (or empty state).
- **Demo block (optional).** Only if demo session is active: attempt create and expect the demo protection message rather than a new row.
- **Proof.** Screenshot list-after-create into `$VERIFY_EVIDENCE_DIR/professionals-created.png`.

## Gotchas

- Demo user (`demo@sistema-ferias.com`) cannot mutate; API returns the demo protection response.
- Search is debounced in the page state filter — wait for list text to change.
- Delete uses `window.confirm`; Playwright must accept the dialog (`page.once('dialog', d => d.accept())`).
- Revenue uses a dotted decimal in the placeholder (`15000.00`); send a plain number string.
- Labels are not `htmlFor`-linked; locate inputs inside the visible form card after opening `Novo Profissional`.
