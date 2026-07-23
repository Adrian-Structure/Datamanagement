#!/usr/bin/env bash
# preflight.sh — verify a project is ready to deploy.
# Checks: Git installed, Node installed, and the project's .env carries the
# Supabase variables the app needs. Exits 0 only if everything passes.
#
# Usage: bash preflight.sh /path/to/project
set -u

PROJECT_DIR="${1:-.}"
FAIL=0

pass() { printf '  ✅ %s\n' "$1"; }
fail() { printf '  ⛔ %s\n' "$1"; FAIL=1; }

echo "Preflight check for: ${PROJECT_DIR}"
echo "---------------------------------------------"

# 1. Git installed (needed for versioning + GitHub push)
if command -v git >/dev/null 2>&1; then
  pass "Git installed ($(git --version 2>/dev/null | head -n1))"
else
  fail "Git NOT installed — install it so snapshots and GitHub push work."
fi

# 2. Node installed (Next.js runtime / build)
if command -v node >/dev/null 2>&1; then
  pass "Node installed ($(node --version 2>/dev/null))"
else
  fail "Node NOT installed — install Node.js to build/run the Next.js app."
fi

# 3. Project folder exists
if [ ! -d "${PROJECT_DIR}" ]; then
  fail "Project folder not found: ${PROJECT_DIR}"
  echo "---------------------------------------------"
  echo "⛔ ACTION NEEDED — fix the item(s) above, then re-run."
  exit 2
fi

# 4. .env present and carrying the required Supabase variables
ENV_FILE="${PROJECT_DIR%/}/.env"
[ -f "${ENV_FILE}" ] || ENV_FILE="${PROJECT_DIR%/}/.env.local"

# Required keys: a Supabase project URL and at least one Supabase key.
NEED_URL_RE='SUPABASE_URL='
NEED_KEY_RE='SUPABASE.*(ANON|SERVICE_ROLE|KEY)='

if [ -f "${ENV_FILE}" ]; then
  pass ".env found ($(basename "${ENV_FILE}"))"
  if grep -Eq "${NEED_URL_RE}" "${ENV_FILE}"; then
    pass "Supabase project URL present"
  else
    fail "Supabase project URL missing (expected a *SUPABASE_URL= line)"
  fi
  if grep -Eiq "${NEED_KEY_RE}" "${ENV_FILE}"; then
    pass "Supabase key present"
  else
    fail "Supabase key missing (expected a *SUPABASE*ANON/SERVICE_ROLE/KEY= line)"
  fi
else
  fail ".env not found in project — the Supabase URL and keys must be set before deploy."
fi

echo "---------------------------------------------"
if [ "${FAIL}" -eq 0 ]; then
  echo "✅ ALL CHECKS PASSED — safe to deploy."
  exit 0
else
  echo "⛔ ACTION NEEDED — fix the item(s) above, then re-run before deploying."
  exit 1
fi
