#!/usr/bin/env bash
# Start an isolated next dev for verify-sistema-ferias (filesystem DB, no Supabase).
# Usage: .cursor/skills/verify-sistema-ferias/helpers/launch.sh
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "${SKILL_DIR}/../../.." && pwd)"
PORT="${VERIFY_PORT:-5055}"
HOST="${VERIFY_HOST:-127.0.0.1}"
PID_FILE="/tmp/verify-sistema-ferias-${PORT}.pid"
LOG_FILE="/tmp/verify-sistema-ferias-${PORT}.log"
ENV_FILE="${REPO_ROOT}/.env.local"
MARKER="# verify-sistema-ferias-managed"

if [[ -f "${PID_FILE}" ]]; then
  old_pid="$(cat "${PID_FILE}")"
  if kill -0 "${old_pid}" 2>/dev/null; then
    echo "launch: already running pid ${old_pid} on port ${PORT}" >&2
    exit 0
  fi
  rm -f "${PID_FILE}"
fi

if command -v ss >/dev/null 2>&1; then
  if ss -ltn "sport = :${PORT}" 2>/dev/null | grep -q LISTEN; then
    echo "launch: port ${PORT} already in use by something else; aborting" >&2
    exit 1
  fi
fi

cd "${REPO_ROOT}"

if [[ ! -d node_modules/next ]]; then
  if [[ -f package-lock.json ]]; then
    npm ci --no-audit --no-fund
  else
    npm install --no-audit --no-fund
  fi
fi

# Local filesystem mode: deliberately omit Supabase keys so lib/db-switch.ts
# uses lib/db.ts JSON files under data/.
SECRET="$(openssl rand -base64 32)"
{
  echo "${MARKER}"
  echo "NEXTAUTH_URL=http://${HOST}:${PORT}"
  echo "NEXTAUTH_SECRET=${SECRET}"
} > "${ENV_FILE}"

# Do not export Supabase vars into the child environment.
unset NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY || true

npx next dev -H "${HOST}" -p "${PORT}" >"${LOG_FILE}" 2>&1 &
echo $! >"${PID_FILE}"

echo "launch: pid $(cat "${PID_FILE}") url http://${HOST}:${PORT} log ${LOG_FILE}"
