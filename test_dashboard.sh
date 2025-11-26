#!/bin/bash

# =============================================
# Script de Tests - PeeloCar Dashboard API
# =============================================

# Configuration
BASE_URL="http://localhost:7568"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjY1YTAzYjZlMmY3MDRjNjk4ZGIyYmJhNiIsImRpc3BsYXlOYW1lIjoiTWFtYWRvdSBESUVZRSIsInBob3RvVVJMIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS1pyc2ZaWk1KR2xNWmVLTXBtdk9SeldlaU01YzNuTDBHVWZ3MTNpUTA9czk2LWMiLCJlbWFpbCI6ImRpZXllYm93QGdtYWlsLmNvbSIsInJlZnJlc2hUb2tlbiI6IkFNZi12QnctMnBEY2FUdUFITmpyYzVObURFQ09wOTNhVGY2MEpXckw4ZWliMXpna21aYUxSYmh4emlmVUExclVXUWlTcy16UUNnZVJYanZNZDFBbEkwcUd3SDdkNlo2MGFUZmYxd3k3N1ZNTzctb21pNG8zUU9TazhpOGdHRmFFRUxYZWo4bHlNaUxES0lSN3N5N29rYjV0R3dfenJLVU5ndVpzenczTjlPYmlkSW43M180Zy1zRk1mVWV2LXZvUEI4eVozWE92TVotQzBUTUxYQ1ozMmZ2WXVpczQ5WU5IbUphVEhXVWctajk4RXNnb3VERHk5ZkpJTTJfUFE0OVVkTEpsU0hLQ24tSHcwYThxbDZUdXhvUkhGbEtkUldWdGNDUVFFT1lQdVpXd0Nqb0c2ZzluZ2dFUi0wVWZuWUtEUGVRcll5Wk00VUM3VzRtY2RuVUlPeTk1TG00UFI0LUVtSm9lRGxTdklISDNFMW50UkRCOUc5LUpueGt5RW1ZQmNEX2xjTzNYdXhaUWx2NFVidDlJVnlJTGI4a0ZXNUhtczBUYVctMFdTZDZCb3R6ODdyQ1Y0UVl1QVg4c1V1aEZNSU1xVDJGOWtWbEwiLCJhY2Nlc3NUb2tlbiI6ImV5SmhiR2NpT2lKU1V6STFOaUlzSW10cFpDSTZJamRqWmpkbU9EY3lOekE1TVdVMFl6YzNZV0U1T1RWa1lqWXdOelF6WWpka1pESmlZamN3WWpVaUxDSjBlWEFpT2lKS1YxUWlmUS5leUp1WVcxbElqb2lUV0Z0WVdSdmRTQkVTVVZaUlNJc0luQnBZM1IxY21VaU9pSm9kSFJ3Y3pvdkwyeG9NeTVuYjI5bmJHVjFjMlZ5WTI5dWRHVnVkQzVqYjIwdllTOUJRMmM0YjJOTFduSnpabHBhVFVwSGJFMWFaVXROY0cxMlQxSjZWMlZwVFRWak0yNU1NRWRWWm5jeE0ybFJNRDF6T1RZdFl5SXNJbWx6Y3lJNkltaDBkSEJ6T2k4dmMyVmpkWEpsZEc5clpXNHVaMjl2WjJ4bExtTnZiUzlqYUdGMFltOTBMWGRvWVhSellYQndMVGMwTVRWaElpd2lZWFZrSWpvaVkyaGhkR0p2ZEMxM2FHRjBjMkZ3Y0MwM05ERTFZU0lzSW1GMWRHaGZkR2x0WlNJNk1UY3dORGs1T0RZek5Dd2lkWE5sY2w5cFpDSTZJbGMwTWxSQlFXTnBiVmhrY1hodVVqSlBZVXd3ZURkb1lraG9XaklpTENKemRXSWlPaUpYTkRKVVFVRmphVzFZWkhGb2JsSXlUMkZNTUhnM2FHSklhRm95SWl3aWFXRjBJam94TnpBME9UazROak0wTENKbGVIQWlPakUzTURVd01ESXlNelFzSW1WdFlXbHNJam9pWkdsbGVXVmliM2RBWjIxaGFXd3VZMjl0SWl3aVpXMWhhV3hmZG1WeWFXWnBaV1FpT25SeWRXVXNJbVpwY21WaVlYTmxJanA3SW1sa1pXNTBhWFJwWlhNaU9uc2laMjl2WjJ4bExtTnZiU0k2V3lJeE1USTRNemM1T0RnNU9EZzJOVEl4Tmpnek16WWlYU3dpWlcxaGFXd2lPbHNpWkdsbGVXVmliM2RBWjIxaGFXd3VZMjl0SWwxOUxDSnphV2R1WDJsdVgzQnliM1pwWkdWeUlqb2laMjl2WjJ4bExtTnZiU0o5ZlEuY01uUWNlZWVfRUg2NlhMRmJ1XzE3RWY2ekptTkY1TURlSjRMZmZRcEN5VEFCaWVNbjBBLVhqWlNualZlRWE5V2R1dm9sVE5ScUVzNHliZ0d3bFlzM2VPZGhnX05RQWptLUY3VzdacDdHcVZGblZBUkktZDA3c044UXh5TEJOQzd2WUFtMjBwRDMwVEFmQU5qdHdNNmJBTjNuMHB1REZqc3FvSThNeGZWYndwZGI1Ny01UzFtR2xEOGhuZWVjUWxJNGdKNGgxbW1oSXhpdkxEX1JyTS1hb2wzUnNLZjloajBQVDYwRWlPTG9TZlBwelBCLTJtVm5TSU1haU8weXd4ZTJLYmlwVmpkWTVIZllDX0JGZzJZMGpaNGRpaHFsdUo2aS1LREdLTXdhc29JUXdvdHRybms5eVpLdGtlZTRCWmV3UjdpTmtZMk1jZjRlUE5ydC0tVU5nIiwiZXhwaXJhdGlvblRpbWUiOiIxNzA1MDAyMjM0MDMwIn0sImlhdCI6MTc2MzU1NTU0NywiZXhwIjoxNzYzNTU5MTQ3fQ.Tt8ALBbM9ooV2mStV_qbEoo9AWOEnXhS6wQ97YAlv-Y"

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Compteurs
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Fonction pour afficher un titre de section
print_section() {
    echo ""
    echo "=========================================="
    echo "$1"
    echo "=========================================="
    echo ""
}

# Fonction pour tester une route
test_route() {
    local name="$1"
    local endpoint="$2"
    local method="${3:-GET}"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    echo -e "${BLUE}Test $TOTAL_TESTS: $name${NC}"
    echo "Endpoint: $method $endpoint"

    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json")
    fi

    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_CODE:/d')

    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo "Response: $body" | head -c 200
        echo "..."
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "Response: $body"
    fi

    echo ""
}

# =============================================
# Démarrage des tests
# =============================================

print_section "🚀 Démarrage des tests PeeloCar Dashboard API"

# Test de santé (sans auth)
print_section "1️⃣  HEALTH CHECK"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -e "${BLUE}Test $TOTAL_TESTS: Health Check${NC}"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/dashboard/health")
http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE:/d')

if [ "$http_code" == "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo "Response: $body"
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
    echo "L'API ne répond pas. Assurez-vous qu'elle est démarrée sur le port 7569"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    exit 1
fi
echo ""

# =============================================
# AUTOECOLE_USER
# =============================================
print_section "2️⃣  AUTOECOLE_USER - Utilisateurs Admin"

test_route "Nombre total d'admins" "/dashboard/users/count"
test_route "Liste des admins (page 1)" "/dashboard/users/list?page=1&limit=5"

# =============================================
# AUTOECOLES
# =============================================
print_section "3️⃣  AUTOECOLES - Auto-écoles"

test_route "Nombre total d'auto-écoles" "/dashboard/autoecoles/count"
test_route "Liste des auto-écoles" "/dashboard/autoecoles/list?page=1&limit=5"
test_route "Stats des auto-écoles" "/dashboard/autoecoles/stats"

# =============================================
# STUDENTS
# =============================================
print_section "4️⃣  STUDENTS - Élèves"

test_route "Nombre total d'élèves" "/dashboard/students/count"
test_route "Liste des élèves (page 1)" "/dashboard/students/list?page=1&limit=5"
test_route "Liste des élèves avec recherche" "/dashboard/students/list?page=1&limit=5&search=Fall"
test_route "Nouvelles inscriptions par date" "/dashboard/students/by-date"
test_route "Élèves premium" "/dashboard/students/premium?page=1&limit=5"
test_route "Élèves actifs" "/dashboard/students/active"

# =============================================
# QUIZZ
# =============================================
print_section "5️⃣  QUIZZ - Quiz"

test_route "Nombre total de quiz" "/dashboard/quizz/count"
test_route "Liste des quiz" "/dashboard/quizz/list"
test_route "Statistiques des quiz" "/dashboard/quizz/stats"
test_route "Quiz populaires (top 5)" "/dashboard/quizz/popular?limit=5"

# =============================================
# TESTS
# =============================================
print_section "6️⃣  TESTS - Résultats"

test_route "Nombre total de tests" "/dashboard/tests/count"
test_route "Statistiques globales des tests" "/dashboard/tests/stats"
test_route "Tests récents (10 derniers)" "/dashboard/tests/recent?limit=10"
test_route "Classement (top 10)" "/dashboard/tests/leaderboard?limit=10"

# =============================================
# COURSES
# =============================================
print_section "7️⃣  COURSES - Cours"

test_route "Nombre total de cours" "/dashboard/courses/count"
test_route "Liste des cours" "/dashboard/courses/list"
test_route "Statistiques des cours" "/dashboard/courses/stats"

# =============================================
# KPIS
# =============================================
print_section "8️⃣  KPIS - Indicateurs"

test_route "Vue d'ensemble globale" "/dashboard/kpis/global"
test_route "Taux d'engagement" "/dashboard/kpis/engagement?page=1&limit=5"
test_route "Performance globale" "/dashboard/kpis/performance"
test_route "Croissance" "/dashboard/kpis/growth"

# =============================================
# RÉSULTATS FINAUX
# =============================================
print_section "📊 RÉSULTATS DES TESTS"

echo "Total de tests exécutés: $TOTAL_TESTS"
echo -e "${GREEN}Tests réussis: $PASSED_TESTS${NC}"
echo -e "${RED}Tests échoués: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Tous les tests sont passés avec succès! 🎉${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}✗ Certains tests ont échoué. Veuillez vérifier les logs ci-dessus.${NC}"
    exit 1
fi
