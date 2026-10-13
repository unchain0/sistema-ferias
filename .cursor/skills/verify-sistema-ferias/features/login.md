# Login / session

Login lets a user open a session from `/login`, reach the dashboard, and keep that session across reloads. Demo access is a separate button on the same page that calls `POST /api/auth/init-demo` then signs in as `demo@sistema-ferias.com`.

## Sub-features

- `login-open` opens the login form with heading `Sistema de Férias`.
- `login-submit` authenticates with valid credentials and lands on `/dashboard`.
- `login-fail` rejects invalid credentials and stays on `/login`.
- `login-demo` clicks `Acessar Demonstração` (seeds demo data, then signs in). **Known failing on production** — issue #12 (`POST /api/auth/init-demo` → 500).
- `session-persist` keeps the session after a full page reload on `/dashboard`.
- `session-logout` signs out via `Sair` and returns to `/login`.

## How to get to it (user POV)

- Open `http://127.0.0.1:5055/login` (or the verification base URL + `/login`).
- From `/register`, follow the `Faça login` link.
- Unauthenticated visits to `/dashboard`, `/professionals`, or `/vacations` are gated by `middleware.ts` toward the sign-in page.
- On the login card, choose `Acessar Demonstração` for the demo path (read-only account).

## Driving it with Playwright

Preconditions:

- `helpers/doctor.sh` exits 0 against the verification base URL.
- Fresh browser context (no prior NextAuth cookies).
- For `login-submit`, a throwaway user already exists (create via the register feature first).
- Supabase env vars unset for local JSON storage. Do not call production hosts.

- **Open form.** `page.goto(base + '/login')`. Expect heading `Sistema de Férias` and button `Entrar`.
- **Fail login.** Fill `input[type="email"]` with `nobody@example.com` and `input[type="password"]` with `wrong-password`, click `Entrar`. Expect toast text containing `Email ou senha incorretos` and URL still on `/login`.
- **Credentials success.** Fill a real throwaway email/password, click `Entrar`. Expect navigation to `/dashboard` and heading `Dashboard de Impacto Financeiro`.
- **Session persist.** `page.reload()` on `/dashboard`. Expect the same heading and no bounce to `/login`.
- **Logout.** Click `Sair`. Expect URL `/login`.
- **Demo button (known failing journey).** Click `Acessar Demonstração`. The UI calls `POST /api/auth/init-demo` then `signIn` with the demo credentials from `components/LoginForm.tsx`. On production this currently ends on login with a failed init (issue #12). Locally without Supabase it may succeed and show banner `Modo Demonstração`. Record whichever outcome you observe; do not patch app code in this skill.
- **Proof.** Screenshot login form and post-login dashboard into `$VERIFY_EVIDENCE_DIR/`. Write status codes for any curl probes into `transcript.txt`.

Curl companion (read-only, no secrets in output):

```bash
curl -sS -o /dev/null -w '%{http_code}\n' "$BASE/login"
curl -sS -X POST "$BASE/api/auth/init-demo" -w '\n%{http_code}\n' | head -c 400
```

## Gotchas

- `components/Input.tsx` does not wire `htmlFor`/`id`, so Playwright `getByLabel('Email')` is unreliable. Use `input[type="email"]` and `input[type="password"]`.
- Demo account email is hard-coded as `demo@sistema-ferias.com` in `lib/demo-protection.ts`, `components/LoginForm.tsx`, and `lib/seed-demo.ts`. Mutations as that user return 403 from API routes.
- `POST /api/auth/init-demo` is a **known failing production journey** (issue #12). Do not treat a production 500 as a skill bug and do not fix the route here.
- Missing `NEXTAUTH_SECRET` breaks session cookies. launch.sh always sets one.
- `NEXTAUTH_URL` must match the origin you browse; a mismatch yields opaque auth failures.
- Root `/` redirects to `/dashboard` (`app/page.tsx`), which then requires auth — start proofs at `/login` or `/register` directly.
