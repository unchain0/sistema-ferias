# Register

Register lets a new user create an account from `/register` and then sign in from `/login`. This is the primary green local proof path while demo init is unreliable (issue #12).

## Sub-features

- `reg-open` opens the registration form with heading `Criar Conta`.
- `reg-submit` creates an account with valid name, email, and password and redirects to `/login`.
- `reg-email-validate` rejects an invalid email client-side.
- `reg-password-mismatch` rejects when password and confirmation differ.
- `reg-duplicate` rejects an email that already exists (`Email já cadastrado` from `POST /api/auth/register`).
- `reg-then-login` signs in with the new account and lands on `/dashboard`.

## How to get to it (user POV)

- Open `/register` directly.
- From `/login`, follow the `Cadastre-se` link.
- After success the app navigates to `/login` (`app/register/page.tsx`).

## Driving it with Playwright

Preconditions:

- `helpers/doctor.sh` exits 0.
- Fresh browser context.
- Unique email each run, e.g. `verify+<epoch>@example.com`.
- Local filesystem DB (no Supabase env). Rate limit on register is 5 per 15 minutes per IP (`app/api/auth/register/route.ts`).

- **Open form.** `page.goto(base + '/register')`. Expect heading `Criar Conta` and button `Criar Conta`.
- **Email validation.** Fill name, invalid email `not-an-email`, matching passwords; submit. Expect toast `Por favor, insira um email válido`.
- **Password mismatch.** Use a valid email, different password and confirm values; submit. Expect toast `As senhas não coincidem`.
- **Submit valid.** Name `Agente Verify`, unique email, password `senhateste123` twice. Click `Criar Conta`. Expect navigation to `/login` and toast `Conta criada com sucesso`.
- **Login with new account.** On `/login`, fill the same email/password, click `Entrar`. Expect `/dashboard` and heading `Dashboard de Impacto Financeiro`.
- **Proof.** Screenshots: register form, post-register login, dashboard. Helper: `helpers/drive-register.mjs` (invoked by `helpers/run-proof.sh`).

## Gotchas

- Password rules: min 6, max 72 characters (`lib/input-validation.ts` / register page).
- Server also rate-limits register; repeated local runs from one IP can hit 429.
- Do not register `demo@sistema-ferias.com`; that address is reserved for demo protection flows.
- Success goes to `/login`, not straight to the dashboard — the proof must include the subsequent login step.
- Never log or commit the password. Evidence transcripts should redact secrets.
