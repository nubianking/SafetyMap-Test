#!/bin/bash
# Test script for Evidence API

BASE_URL="https://safetymap-test-production.up.railway.app"
# Or use localhost for testing:
# BASE_URL="http://localhost:3000"

echo "=== SafetyMap Evidence API Test ==="
echo ""

# Test 1: No token (should fail)
echo "Test 1: No Authorization header (expect 401)"
curl -s "$BASE_URL/api/v1/evidence" | jq .
echo ""

# Test 2: Invalid token (should fail)
echo "Test 2: Invalid token (expect 401/403)"
curl -s -H "Authorization: Bearer invalid_token" "$BASE_URL/api/v1/evidence" | jq .
echo ""

# If you have valid credentials, uncomment and fill in:
# echo "Test 3: Login and get evidence"
# TOKEN=$(curl -s -X POST "$BASE_URL/api/mappers/login" \
#   -H "Content-Type: application/json" \
#   -d '{"alias": "YOUR_ALIAS", "passkey": "YOUR_PASSKEY"}' | jq -r '.data.token')
# echo "Got token: $TOKEN"
# curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/v1/evidence" | jq .

echo ""
echo "=== Test complete ==="
