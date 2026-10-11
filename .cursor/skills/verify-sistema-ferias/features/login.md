# Login / Session

Login lets an authenticated user access the dashboard and protected routes.

## Sub-features

- `login-open` opens the login form.
- `login-submit` authenticates with valid credentials.
- `login-demo` logs in with the built-in demo account.
- `login-fail` rejects invalid credentials.
- `session-persist` maintains session across page reloads.

## How to get to it (user POV)

- Navigate to `http://127.0.0.1:5000` when not authenticated.
- Click "Faça login" (Login) call-to-action if present on the landing page.
- Use the direct `/login` route.

## Driving it with Playwright

Preconditions:

- App is running at `http://127.0.0.1:5000`.
- No existing session (fresh browser context).
- Demo data is seeded: `POST /api/auth/init-demo` has been called.
- **Open form.** Go to `/login`. The form fields "Email" and "Senha" are visible.
- **Start demo.** Click "Acessar Demonstração". The app initializes its demo account and submits its credentials internally.
- **Success.** Verify the browser navigigates to `/dashboard` and the dashboard header "Dashboard de Impacto Financeiro" is visible.
- **Proof.** Capture screenshot at `artifacts/login/success.png` showing the dashboard. Capture ARIA snapshot at `artifacts/login/success.aria.txt`.
- **Session persist.** Reload the dashboard page. Verify the user remains logged in and the dashboard is still visible.
- **Log out.** (Optional) Click the navbar logout link if present, then re-login to confirm the cycle works.

## Gotchas

- If `NEXTAUTH_SECRET` is not set, the session will not persist across reloads — always verify env vars in the baseline check.
- The demo account is protected by `demo-protection` — attempting modifications via the demo account will return a 403 error. Only read-only operations should be tested with the demo account.
- After login, the app may redirect via a `next` query parameter; verify the final destination is `/dashboard`, not an unexpected route.
- If the browser context still has stale cookies from a prior run, the session state may be ambiguous — always start with a fresh context for each verification run.