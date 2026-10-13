#!/usr/bin/env bash
# Tear down the verify-sistema-ferias instance started by launch.sh.
# Never deletes evidence under .verify-evidence/ or /tmp/verify-sistema-ferias-evidence/.
# Usage: .cursor/skills/verify-sistema-ferias/helpers/cleanup.sh
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "${SKILL_DIR}/../../.." && pwd)"
PORT="${VERIFY_PORT:-5055}"
PID_FILE="/tmp/verify-sistema-ferias-${PORT}.pid"
LOG_FILE="/tmp/verify-sistema-ferias-${PORT}.log"
ENV_FILE="${REPO_ROOT}/.env.local"
MARKER="# verify-sistema-ferias-managed"

if [[ -f "${PID_FILE}" ]]; then
  pid="$(cat "${PID_FILE}")"
  if kill -0 "${pid}" 2>/dev/null; then
    # next dev spawns children; kill the process group when possible
    kill "${pid}" 2>/dev/null || true
    sleep 1
    if kill -0 "${pid}" 2>/dev/null; then
      kill -9 "${pid}" 2>/dev/null || true
    fi
    # Best-effort: children still bound to our port
    if command -v ss >/dev/null 2>&1; then
      kids="$(ss -ltnp "sport = :${PORT}" 2>/dev/null | sed -n 's/.*pid=\([0-9]\+\).*/\1/p' | sort -u || true)"
      for k in ${kids}; do
        kill "${k}" 2>/dev/null || true
      done
      sleep 1
      kids="$(ss -ltnp "sport = :${PORT}" 2>/dev/null | sed -n 's/.*pid=\([0-9]\+\).*/\1/p' | sort -u || true)"
      for k in ${kids}; do
        kill -9 "${k}" 2>/dev/null || true
      done
    fi
  fi
  rm -f "${PID_FILE}"
fi

rm -f "${LOG_FILE}"
rm -f /tmp/verify-sistema-ferias-doctor-login.html /tmp/verify-sistema-ferias-doctor-register.html

if [[ -f "${ENV_FILE}" ]] && grep -qxF "${MARKER}" "${ENV_FILE}"; then
  rm -f "${ENV_FILE}"
fi

if [[ "${VERIFY_WIPE_DATA:-0}" == "1" && -d "${REPO_ROOT}/data" ]]; then
  rm -rf "${REPO_ROOT}/data"
fi

echo "cleanup: done (evidence directories preserved)"
