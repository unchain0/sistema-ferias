# Register

Register lets a new user create an account and log into the Sistema de Férias.

## Sub-features

- `reg-open` opens the registration form.
- `reg-submit` creates a new account with valid name, email, and password.
- `reg-email-validate` rejects invalid email formats.
- `reg-password-mismatch` rejects when password and confirmation differ.
- `reg-success` redirects to login on successful registration.

## How to get to it (user POV)

- Navigate to the app root URL (`http://127.0.0.1:5000`).
- Click the "Criar Conta" (Create Account) call-to-action on the landing/dash entry point.
- Use the direct `/register` route if the landing page hides the registration link.

## Driving it with Playwright

Preconditions:

- App is running at `http://127.0.0.1:5000`.
- No existing account session (browser context is fresh).
- `NEXTAUTH_URL=http://127.0.0.1:5000` and `NEXTAUTH_SECRET` are set in `.env.local`.
- Demo data is seeded via `POST /api/auth/init-demo` (or the account does not yet exist in the DB).

- **Open form.** Go to `/register`. The form fields "Nome", "Email", "Senha", "Confirmar Senha" are visible.
- **Enter name.** Fill the name input with `Agente de Teste`.
- **Enter email.** Fill the email input with `agente-teste+$(date +%s)%40example.com`.
- **Enter password.** Fill the password input with `senhateste123` and confirm with the same value.
- **Submit.** Click the "Criar Conta" button.
- **Success.** Verify the browser navigates away from `/register` (to `/dashboard` or `/login`).
- **Proof.** Capture a screenshot saved at `artifacts/register/success.png` showing the app header or dashboard title. Also capture an ARIA snapshot at `artifacts/register/success.aria.txt`.
- **Email validation.** Re-submit with an invalid email (`not-an-email`). Verify the error `Por favor, insira um email válido` appears.
- **Password mismatch.** Submit with different password and confirmation values. Verify `As senhas não coincidem` error appears.

## Gotchas

- The form uses client-side validation only; server-side validation must also be verified — a submission with mismatched passwords may briefly flash before the error appears.
- If `NEXTAUTH_SECRET` is missing or invalid, the app will crash on registration — always verify the env vars are set in the baseline.
- Newly created accounts may not immediately appear in a session; the verification must check the navigation target, not assume login state.
- Do not reuse the demo account `demo@sistema-ferias.com` for registration tests — it is reserved for the demo-protection flow and will return a 403.