#!/usr/bin/env bash
# One-shot: launch → doctor → drive register → evidence → cleanup.
# Usage: .cursor/skills/verify-sistema-ferias/helpers/run-proof.sh
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "${SKILL_DIR}/../../.." && pwd)"
PORT="${VERIFY_PORT:-5055}"
HOST="${VERIFY_HOST:-127.0.0.1}"
BASE_URL="http://${HOST}:${PORT}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"

if [[ -d "${REPO_ROOT}" && -w "${REPO_ROOT}" ]]; then
  EVIDENCE_ROOT="${REPO_ROOT}/.verify-evidence"
else
  EVIDENCE_ROOT="/tmp/verify-sistema-ferias-evidence"
fi
EVIDENCE_DIR="${EVIDENCE_ROOT}/${STAMP}"
mkdir -p "${EVIDENCE_DIR}"

export VERIFY_PORT="${PORT}"
export VERIFY_HOST="${HOST}"
export VERIFY_BASE_URL="${BASE_URL}"
export VERIFY_EVIDENCE_DIR="${EVIDENCE_DIR}"

cleanup_on_exit() {
  "${SKILL_DIR}/helpers/cleanup.sh" || true
}
trap cleanup_on_exit EXIT

{
  echo "# Proof: register → login → dashboard"
  echo
  echo "- Date (UTC): $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "- Surface: Next.js web UI (App Router) from this checkout"
  echo "- Instance: isolated next dev at ${BASE_URL} (filesystem data/, no Supabase)"
  echo "- Feature: features/register.md then login landing on dashboard"
  echo "- Known failing journey (not required for pass): POST /api/auth/init-demo (issue #12)"
  echo "- Secrets: NEXTAUTH_SECRET generated at runtime; not logged"
  echo
} >"${EVIDENCE_DIR}/PROOF.md"

cd "${REPO_ROOT}"
"${SKILL_DIR}/helpers/launch.sh" 2>&1 | tee -a "${EVIDENCE_DIR}/transcript.txt"
"${SKILL_DIR}/helpers/doctor.sh" "${BASE_URL}" 2>&1 | tee -a "${EVIDENCE_DIR}/transcript.txt"

# Playwright for the browser drive (not a repo dependency; install throwaway).
if [[ ! -d "${REPO_ROOT}/node_modules/playwright" ]]; then
  echo "run-proof: installing playwright (no-save)" | tee -a "${EVIDENCE_DIR}/transcript.txt"
  npm install --no-save --no-audit --no-fund playwright@1.64.0 2>&1 | tail -n 20 | tee -a "${EVIDENCE_DIR}/transcript.txt"
fi
npx playwright install chromium 2>&1 | tail -n 20 | tee -a "${EVIDENCE_DIR}/transcript.txt" || true

set +e
node "${SKILL_DIR}/helpers/drive-register.mjs" 2>&1 | tee -a "${EVIDENCE_DIR}/transcript.txt"
DRIVE_EC=${PIPESTATUS[0]}
set -e

{
  echo
  echo "- Drive exit code: ${DRIVE_EC}"
  echo "- Evidence dir: ${EVIDENCE_DIR}"
  echo "- Screenshots: register-form.png, register-after.png, dashboard-after-login.png"
  echo "- Full transcript: transcript.txt"
} >>"${EVIDENCE_DIR}/PROOF.md"

echo "run-proof: evidence at ${EVIDENCE_DIR} (drive_exit=${DRIVE_EC})"
exit "${DRIVE_EC}"
