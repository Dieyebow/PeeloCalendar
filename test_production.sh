#!/bin/bash

# =============================================
# Tests Production - PeeloCar Dashboard API
# =============================================

BASE_URL="https://autoecole.mojay.pro"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjY1YTAzYjZlMmY3MDRjNjk4ZGIyYmJhNiIsImRpc3BsYXlOYW1lIjoiTWFtYWRvdSBESUVZRSIsInBob3RvVVJMIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS1pyc2ZaWk1KR2xNWmVLTXBtdk9SeldlaU01YzNuTDBHVWZ3MTNpUTA9czk2LWMiLCJlbWFpbCI6ImRpZXllYm93QGdtYWlsLmNvbSIsInJlZnJlc2hUb2tlbiI6IkFNZi12QnctMnBEY2FUdUFITmpyYzVObURFQ09wOTNhVGY2MEpXckw4ZWliMXpna21aYUxSYmh4emlmVUExclVXUWlTcy16UUNnZVJYanZNZDFBbEkwcUd3SDdkNlo2MGFUZmYxd3k3N1ZNTzctb21pNG8zUU9TazhpOGdHRmFFRUxYZWo4bHlNaUxES0lSN3N5N29rYjV0R3dfenJLVU5ndVpzenczTjlPYmlkSW43M180Zy1zRk1mVWV2LXZvUEI4eVozWE92TVotQzBUTUxYQ1ozMmZ2WXVpczQ5WU5IbUphVEhXVWctajk4RXNnb3VERHk5ZkpJTTJfUFE0OVVkTEpsU0hLQ24tSHcwYThxbDZUdXhvUkhGbEtkUldWdGNDUVFFT1lQdVpXd0Nqb0c2ZzluZ2dFUi0wVWZuWUtEUGVRcll5Wk00VUM3VzRtY2RuVUlPeTk1TG00UFI0LUVtSm9lRGxTdklISDNFMW50UkRCOUc5LUpueGt5RW1ZQmNEX2xjTzNYdXhaUWx2NFVidDlJVnlJTGI4a0ZXNUhtczBUYVctMFdTZDZCb3R6ODdyQ1Y0UVl1QVg4c1V1aEZNSU1xVDJGOWtWbEwiLCJhY2Nlc3NUb2tlbiI6ImV5SmhiR2NpT2lKU1V6STFOaUlzSW10cFpDSTZJamRqWmpkbU9EY3lOekE1TVdVMFl6YzNZV0U1T1RWa1lqWXdOelF6WWpka1pESmlZamN3WWpVaUxDSjBlWEFpT2lKS1YxUWlmUS5leUp1WVcxbElqb2lUV0Z0WVdSdmRTQkVTVVZaUlNJc0luQnBZM1IxY21VaU9pSm9kSFJ3Y3pvdkwyeG9NeTVuYjI5bmJHVjFjMlZ5WTI5dWRHVnVkQzVqYjIwdllTOUJRMmM0YjJOTFduSnpabHBhVFVwSGJFMWFaVXROY0cxMlQxSjZWMlZwVFRWak0yNU1NRWRWWm5jeE0ybFJNRDF6T1RZdFl5SXNJbWx6Y3lJNkltaDBkSEJ6T2k4dmMyVmpkWEpsZEc5clpXNHVaMjl2WjJ4bExtTnZiUzlqYUdGMFltOTBMWGRvWVhSellYQndMVGMwTVRWaElpd2lZWFZrSWpvaVkyaGhkR0p2ZEMxM2FHRjBjMkZ3Y0MwM05ERTFZU0lzSW1GMWRHaGZkR2x0WlNJNk1UY3dORGs1T0RZek5Dd2lkWE5sY2w5cFpDSTZJbGMwTWxSQlFXTnBiVmhrY1hodVVqSlBZVXd3ZURkb1lraG9XaklpTENKemRXSWlPaUpYTkRKVVFVRmphVzFZWkhGb2JsSXlUMkZNTUhnM2FHSklhRm95SWl3aWFXRjBJam94TnpBME9UazROak0wTENKbGVIQWlPakUzTURVd01ESXlNelFzSW1WdFlXbHNJam9pWkdsbGVXVmliM2RBWjIxaGFXd3VZMjl0SWl3aVpXMWhhV3hmZG1WeWFXWnBaV1FpT25SeWRXVXNJbVpwY21WaVlYTmxJanA3SW1sa1pXNTBhWFJwWlhNaU9uc2laMjl2WjJ4bExtTnZiU0k2V3lJeE1USTRNemM1T0RnNU9EZzJOVEl4Tmpnek16WWlYU3dpWlcxaGFXd2lPbHNpWkdsbGVXVmliM2RBWjIxaGFXd3VZMjl0SWwxOUxDSnphV2R1WDJsdVgzQnliM1pwWkdWeUlqb2laMjl2WjJ4bExtTnZiU0o5ZlEuY01uUWNlZWVfRUg2NlhMRmJ1XzE3RWY2ekptTkY1TURlSjRMZmZRcEN5VEFCaWVNbjBBLVhqWlNualZlRWE5V2R1dm9sVE5ScUVzNHliZ0d3bFlzM2VPZGhnX05RQWptLUY3VzdacDdHcVZGblZBUkktZDA3c044UXh5TEJOQzd2WUFtMjBwRDMwVEFmQU5qdHdNNmJBTjNuMHB1REZqc3FvSThNeGZWYndwZGI1Ny01UzFtR2xEOGhuZWVjUWxJNGdKNGgxbW1oSXhpdkxEX1JyTS1hb2wzUnNLZjloajBQVDYwRWlPTG9TZlBwelBCLTJtVm5TSU1haU8weXd4ZTJLYmlwVmpkWTVIZllDX0JGZzJZMGpaNGRpaHFsdUo2aS1LREdLTXdhc29JUXdvdHRybms5eVpLdGtlZTRCWmV3UjdpTmtZMk1jZjRlUE5ydC0tVU5nIiwiZXhwaXJhdGlvblRpbWUiOiIxNzA1MDAyMjM0MDMwIn0sImlhdCI6MTc2MzU1NTU0NywiZXhwIjoxNzYzNTU5MTQ3fQ.Tt8ALBbM9ooV2mStV_qbEoo9AWOEnXhS6wQ97YAlv-Y"

OUTPUT_FILE="/home/ec2-user/PeeloCalendar/RESULTATS_PRODUCTION.md"

# Initialiser le fichier de résultats
cat > "$OUTPUT_FILE" << 'HEADER'
# 📊 Résultats des Tests - Production PeeloCar Dashboard

**Date**: $(date '+%Y-%m-%d %H:%M:%S')
**Base URL**: https://autoecole.mojay.pro

---

HEADER

echo "# Tests en cours sur l'environnement de production..."
echo "# Résultats enregistrés dans: $OUTPUT_FILE"
echo ""

# Fonction pour tester et enregistrer
test_endpoint() {
    local name="$1"
    local endpoint="$2"

    echo "## $name" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "**Endpoint**: \`GET $endpoint\`" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "**Requête curl**:" >> "$OUTPUT_FILE"
    echo '```bash' >> "$OUTPUT_FILE"
    echo "curl -H \"Authorization: Bearer \$TOKEN\" \\" >> "$OUTPUT_FILE"
    echo "  \"$BASE_URL$endpoint\"" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"

    echo "Testing: $name..."

    response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL$endpoint" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")

    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_CODE:/d')

    echo "**Status HTTP**: $http_code" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "**Réponse**:" >> "$OUTPUT_FILE"
    echo '```json' >> "$OUTPUT_FILE"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "---" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"

    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo "✓ PASSED"
    else
        echo "✗ FAILED (HTTP $http_code)"
    fi
}

# Tests Health Check
echo "=== HEALTH CHECK ===" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

test_endpoint "Health Check" "/dashboard/health"

# Tests AUTOECOLES
echo "=== AUTO-ÉCOLES ===" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

test_endpoint "Nombre d'auto-écoles" "/dashboard/autoecoles/count"
test_endpoint "Liste des auto-écoles" "/dashboard/autoecoles/list?page=1&limit=5"
test_endpoint "Statistiques des auto-écoles" "/dashboard/autoecoles/stats"

# Tests STUDENTS
echo "=== ÉLÈVES ===" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

test_endpoint "Nombre d'élèves" "/dashboard/students/count"
test_endpoint "Liste des élèves (page 1)" "/dashboard/students/list?page=1&limit=5"
test_endpoint "Élèves premium" "/dashboard/students/premium?page=1&limit=5"
test_endpoint "Élèves actifs" "/dashboard/students/active"
test_endpoint "Inscriptions par date" "/dashboard/students/by-date"

# Tests QUIZ
echo "=== QUIZ ===" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

test_endpoint "Nombre de quiz" "/dashboard/quizz/count"
test_endpoint "Liste des quiz" "/dashboard/quizz/list"
test_endpoint "Stats des quiz" "/dashboard/quizz/stats"
test_endpoint "Quiz populaires (top 5)" "/dashboard/quizz/popular?limit=5"

# Tests TESTS
echo "=== RÉSULTATS DES TESTS ===" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

test_endpoint "Nombre de tests" "/dashboard/tests/count"
test_endpoint "Stats globales des tests" "/dashboard/tests/stats"
test_endpoint "Tests récents (10 derniers)" "/dashboard/tests/recent?limit=10"
test_endpoint "Classement (top 10)" "/dashboard/tests/leaderboard?limit=10"

# Tests COURSES
echo "=== COURS ===" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

test_endpoint "Nombre de cours" "/dashboard/courses/count"
test_endpoint "Liste des cours" "/dashboard/courses/list"
test_endpoint "Stats des cours" "/dashboard/courses/stats"

# Tests KPIS
echo "=== KPIs & ANALYTICS ===" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

test_endpoint "KPIs globaux" "/dashboard/kpis/global"
test_endpoint "Engagement" "/dashboard/kpis/engagement?page=1&limit=5"
test_endpoint "Performance" "/dashboard/kpis/performance"
test_endpoint "Croissance" "/dashboard/kpis/growth"

echo ""
echo "✅ Tests terminés !"
echo "📄 Résultats disponibles dans: $OUTPUT_FILE"
