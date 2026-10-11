---
name: verify-sistema-ferias
description: Verify sistema-ferias (Next.js 16, port 5000, demo mode) — drive login/dashboard, capture evidence under evidence/.
---

# verify-sistema-ferias

- Launch: npm run dev (port 5000). Doctor: curl -s -o /dev/null -w '%{http_code}' http://localhost:5000/login
- Drive: browser to /login, click "Acessar Demonstração". Evidence: evidence/verify-<run>.png + transcript.
- Cleanup: kill dev process started; do not delete evidence/.
- Secrets: generate NEXTAUTH_SECRET at runtime (openssl rand -base64 32); never commit.
