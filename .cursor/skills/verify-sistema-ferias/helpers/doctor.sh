#!/usr/bin/env bash
# Read-only readiness probe for verify-sistema-ferias.
# Usage: .cursor/skills/verify-sistema-ferias/helpers/doctor.sh [base-url]
set -euo pipefail

PORT="${VERIFY_PORT:-5055}"
HOST="${VERIFY_HOST:-127.0.0.1}"
BASE_URL="${1:-http://${HOST}:${PORT}}"

html=""
ok=0
for _ in $(seq 1 60); do
  code="$(curl -sS -o /tmp/verify-sistema-ferias-doctor-login.html -w '%{http_code}' \
    "${BASE_URL}/login" 2>/dev/null || echo "000")"
  if [[ "${code}" == "200" ]]; then
    html="$(cat /tmp/verify-sistema-ferias-doctor-login.html)"
    ok=1
    break
  fi
  sleep 1
done

if [[ "${ok}" -ne 1 ]]; then
  echo "doctor: ${BASE_URL}/login not HTTP 200 (last=${code:-none})" >&2
  exit 1
fi

case "${html}" in
  *"Sistema de Férias"*) ;;
  *)
    echo "doctor: /login body missing 'Sistema de Férias' (foreign server?)" >&2
    exit 1
    ;;
esac

reg_code="$(curl -sS -o /tmp/verify-sistema-ferias-doctor-register.html -w '%{http_code}' \
  "${BASE_URL}/register" 2>/dev/null || echo "000")"
reg_html="$(cat /tmp/verify-sistema-ferias-doctor-register.html 2>/dev/null || true)"
if [[ "${reg_code}" != "200" ]]; then
  echo "doctor: /register not HTTP 200 (${reg_code})" >&2
  exit 1
fi
case "${reg_html}" in
  *"Criar Conta"*) ;;
  *)
    echo "doctor: /register body missing 'Criar Conta'" >&2
    exit 1
    ;;
esac

echo "doctor: OK (${BASE_URL})"
