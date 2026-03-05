#!/usr/bin/env bash
set -euo pipefail

BASE="${1:-http://localhost:3000}"
TS=$(date +%s)
EMAIL="ci_run_${TS}@plate.test"
COOK_EMAIL="ci_cook_${TS}@plate.test"
JAR="/tmp/ci_cookies_${TS}.txt"
PASS=0
FAIL=0

check() {
  local label="$1" expected="$2" actual="$3"
  if [[ "$actual" == *"$expected"* ]]; then
    echo "  ✅  $label"
    PASS=$((PASS+1))
  else
    echo "  ❌  $label  (expected '$expected' in: $actual)"
    FAIL=$((FAIL+1))
  fi
}

# ── 1. REGISTER (new customer) ────────────────────────────────
echo ""
echo "1. Register new customer"
R=$(curl -s -c "$JAR" -w "\n__STATUS__%{http_code}" \
  -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"CI User\",\"email\":\"$EMAIL\",\"password\":\"pass1234\",\"role\":\"CUSTOMER\"}" \
  --max-time 15)
BODY=$(echo "$R" | sed '$d')
STATUS=$(echo "$R" | tail -1 | sed 's/__STATUS__//')
check "HTTP 201" "201" "$STATUS"
check "success:true" '"success":true' "$BODY"
check "role:CUSTOMER" '"role":"CUSTOMER"' "$BODY"

# ── 2. REGISTER (duplicate → 409) ────────────────────────────
echo ""
echo "2. Register duplicate (expect 409)"
R=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"CI User\",\"email\":\"$EMAIL\",\"password\":\"pass1234\",\"role\":\"CUSTOMER\"}" \
  --max-time 15)
BODY=$(echo "$R" | sed '$d')
STATUS=$(echo "$R" | tail -1 | sed 's/__STATUS__//')
check "HTTP 409" "409" "$STATUS"
check "error message present" '"error":' "$BODY"

# ── 3. REGISTER COOK ──────────────────────────────────────────
echo ""
echo "3. Register new cook"
R=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"CI Cook\",\"email\":\"$COOK_EMAIL\",\"password\":\"pass1234\",\"role\":\"COOK\",\"neighborhood\":\"Brooklyn\",\"specialties\":[\"Indian\",\"Italian\"]}" \
  --max-time 15)
BODY=$(echo "$R" | sed '$d')
STATUS=$(echo "$R" | tail -1 | sed 's/__STATUS__//')
check "HTTP 201" "201" "$STATUS"
check "role:COOK" '"role":"COOK"' "$BODY"
check "cookProfile present" '"cookProfile":{' "$BODY"
check "specialties saved" 'Indian, Italian' "$BODY"

# ── 4. LOGIN (valid) ───────────────────────────────────────────
echo ""
echo "4. Login with valid credentials"
R=$(curl -s -c "$JAR" -w "\n__STATUS__%{http_code}" \
  -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"pass1234\"}" \
  --max-time 15)
BODY=$(echo "$R" | sed '$d')
STATUS=$(echo "$R" | tail -1 | sed 's/__STATUS__//')
check "HTTP 200" "200" "$STATUS"
check "success:true" '"success":true' "$BODY"

# ── 5. LOGIN (wrong password → 401) ───────────────────────────
echo ""
echo "5. Login with wrong password (expect 401)"
R=$(curl -s -w "\n__STATUS__%{http_code}" \
  -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"WRONG_PASS\"}" \
  --max-time 15)
STATUS=$(echo "$R" | tail -1 | sed 's/__STATUS__//')
check "HTTP 401" "401" "$STATUS"

# ── 6. SESSION: /api/auth/me ───────────────────────────────────
echo ""
echo "6. GET /api/auth/me with session cookie"
R=$(curl -s -b "$JAR" -w "\n__STATUS__%{http_code}" \
  "$BASE/api/auth/me" --max-time 10)
BODY=$(echo "$R" | sed '$d')
STATUS=$(echo "$R" | tail -1 | sed 's/__STATUS__//')
check "HTTP 200" "200" "$STATUS"
check "returns user" '"success":true' "$BODY"

# ── 7. SESSION: /api/auth/me (no cookie → 401) ────────────────
echo ""
echo "7. GET /api/auth/me without cookie (expect 401)"
R=$(curl -s -w "\n__STATUS__%{http_code}" \
  "$BASE/api/auth/me" --max-time 10)
STATUS=$(echo "$R" | tail -1 | sed 's/__STATUS__//')
check "HTTP 401" "401" "$STATUS"

# ── 8. LOGOUT ─────────────────────────────────────────────────
echo ""
echo "8. POST /api/auth/logout"
R=$(curl -s -b "$JAR" -c "$JAR" -w "\n__STATUS__%{http_code}" \
  -X POST "$BASE/api/auth/logout" --max-time 10)
STATUS=$(echo "$R" | tail -1 | sed 's/__STATUS__//')
check "HTTP 200" "200" "$STATUS"

# ── 9. /api/auth/me after logout (expect 401) ─────────────────
echo ""
echo "9. GET /api/auth/me after logout (expect 401)"
R=$(curl -s -b "$JAR" -w "\n__STATUS__%{http_code}" \
  "$BASE/api/auth/me" --max-time 10)
STATUS=$(echo "$R" | tail -1 | sed 's/__STATUS__//')
check "HTTP 401" "401" "$STATUS"

# ── 10. Public routes ─────────────────────────────────────────
echo ""
echo "10. Public API routes"
R=$(curl -s -w "\n__STATUS__%{http_code}" "$BASE/api/cooks" --max-time 10)
STATUS=$(echo "$R" | tail -1 | sed 's/__STATUS__//')
check "GET /api/cooks 200" "200" "$STATUS"

R=$(curl -s -w "\n__STATUS__%{http_code}" "$BASE/api/dishes" --max-time 10)
STATUS=$(echo "$R" | tail -1 | sed 's/__STATUS__//')
check "GET /api/dishes 200" "200" "$STATUS"

# ── 11. DB persistence check ──────────────────────────────────
echo ""
echo "11. DB persistence (Prisma Postgres)"
DB_RESULT=$(node --input-type=module << 'EOF'
import { PrismaClient } from '/Users/tapasbanerjee/plate/node_modules/@prisma/client/default.js';
import { withAccelerate } from '/Users/tapasbanerjee/plate/node_modules/@prisma/extension-accelerate/dist/index.js';
const prisma = new PrismaClient({ accelerateUrl: process.env.DATABASE_URL }).$extends(withAccelerate());
const count = await prisma.user.count();
console.log(count);
await prisma.$disconnect();
EOF
)
if [[ "$DB_RESULT" -gt 0 ]]; then
  echo "  ✅  Prisma Postgres connected — $DB_RESULT user(s) in DB"
  PASS=$((PASS+1))
else
  echo "  ❌  DB returned 0 users (expected > 0)"
  FAIL=$((FAIL+1))
fi

# ── Summary ───────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════"
echo "  RESULTS: ${PASS} passed  /  ${FAIL} failed"
echo "════════════════════════════════════════"

# Clean up test cookies
rm -f "$JAR"

[[ "$FAIL" -eq 0 ]]
