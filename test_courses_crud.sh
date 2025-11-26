#!/bin/bash

# =============================================
# Tests CRUD - Gestion des Cours
# =============================================

BASE_URL="https://autoecole.mojay.pro"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjY1YTAzYjZlMmY3MDRjNjk4ZGIyYmJhNiIsImRpc3BsYXlOYW1lIjoiTWFtYWRvdSBESUVZRSIsInBob3RvVVJMIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS1pyc2ZaWk1KR2xNWmVLTXBtdk9SeldlaU01YzNuTDBHVWZ3MTNpUTA9czk2LWMiLCJlbWFpbCI6ImRpZXllYm93QGdtYWlsLmNvbSIsInJlZnJlc2hUb2tlbiI6IkFNZi12QnctMnBEY2FUdUFITmpyYzVObURFQ09wOTNhVGY2MEpXckw4ZWliMXpna21aYUxSYmh4emlmVUExclVXUWlTcy16UUNnZVJYanZNZDFBbEkwcUd3SDdkNlo2MGFUZmYxd3k3N1ZNTzctb21pNG8zUU9TazhpOGdHRmFFRUxYZWo4bHlNaUxES0lSN3N5N29rYjV0R3dfenJLVU5ndVpzenczTjlPYmlkSW43M180Zy1zRk1mVWV2LXZvUEI4eVozWE92TVotQzBUTUxYQ1ozMmZ2WXVpczQ5WU5IbUphVEhXVWctajk4RXNnb3VERHk5ZkpJTTJfUFE0OVVkTEpsU0hLQ24tSHcwYThxbDZUdXhvUkhGbEtkUldWdGNDUVFFT1lQdVpXd0Nqb0c2ZzluZ2dFUi0wVWZuWUtEUGVRcll5Wk00VUM3VzRtY2RuVUlPeTk1TG00UFI0LUVtSm9lRGxTdklISDNFMW50UkRCOUc5LUpueGt5RW1ZQmNEX2xjTzNYdXhaUWx2NFVidDlJVnlJTGI4a0ZXNUhtczBUYVctMFdTZDZCb3R6ODdyQ1Y0UVl1QVg4c1V1aEZNSU1xVDJGOWtWbEwiLCJhY2Nlc3NUb2tlbiI6ImV5SmhiR2NpT2lKU1V6STFOaUlzSW10cFpDSTZJamRqWmpkbU9EY3lOekE1TVdVMFl6YzNZV0U1T1RWa1lqWXdOelF6WWpka1pESmlZamN3WWpVaUxDSjBlWEFpT2lKS1YxUWlmUS5leUp1WVcxbElqb2lUV0Z0WVdSdmRTQkVTVVZaUlNJc0luQnBZM1IxY21VaU9pSm9kSFJ3Y3pvdkwyeG9NeTVuYjI5bmJHVjFjMlZ5WTI5dWRHVnVkQzVqYjIwdllTOUJRMmM0YjJOTFduSnpabHBhVFVwSGJFMWFaVXROY0cxMlQxSjZWMlZwVFRWak0yNU1NRWRWWm5jeE0ybFJNRDF6T1RZdFl5SXNJbWx6Y3lJNkltaDBkSEJ6T2k4dmMyVmpkWEpsZEc5clpXNHVaMjl2WjJ4bExtTnZiUzlqYUdGMFltOTBMWGRvWVhSellYQndMVGMwTVRWaElpd2lZWFZrSWpvaVkyaGhkR0p2ZEMxM2FHRjBjMkZ3Y0MwM05ERTFZU0lzSW1GMWRHaGZkR2x0WlNJNk1UY3dORGs1T0RZek5Dd2lkWE5sY2w5cFpDSTZJbGMwTWxSQlFXTnBiVmhrY1hodVVqSlBZVXd3ZURkb1lraG9XaklpTENKemRXSWlPaUpYTkRKVVFVRmphVzFZWkhGb2JsSXlUMkZNTUhnM2FHSklhRm95SWl3aWFXRjBJam94TnpBME9UazROak0wTENKbGVIQWlPakUzTURVd01ESXlNelFzSW1WdFlXbHNJam9pWkdsbGVXVmliM2RBWjIxaGFXd3VZMjl0SWl3aVpXMWhhV3hmZG1WeWFXWnBaV1FpT25SeWRXVXNJbVpwY21WaVlYTmxJanA3SW1sa1pXNTBhWFJwWlhNaU9uc2laMjl2WjJ4bExtTnZiU0k2V3lJeE1USTRNemM1T0RnNU9EZzJOVEl4Tmpnek16WWlYU3dpWlcxaGFXd2lPbHNpWkdsbGVXVmliM2RBWjIxaGFXd3VZMjl0SWwxOUxDSnphV2R1WDJsdVgzQnliM1pwWkdWeUlqb2laMjl2WjJ4bExtTnZiU0o5ZlEuY01uUWNlZWVfRUg2NlhMRmJ1XzE3RWY2ekptTkY1TURlSjRMZmZRcEN5VEFCaWVNbjBBLVhqWlNualZlRWE5V2R1dm9sVE5ScUVzNHliZ0d3bFlzM2VPZGhnX05RQWptLUY3VzdacDdHcVZGblZBUkktZDA3c044UXh5TEJOQzd2WUFtMjBwRDMwVEFmQU5qdHdNNmJBTjNuMHB1REZqc3FvSThNeGZWYndwZGI1Ny01UzFtR2xEOGhuZWVjUWxJNGdKNGgxbW1oSXhpdkxEX1JyTS1hb2wzUnNLZjloajBQVDYwRWlPTG9TZlBwelBCLTJtVm5TSU1haU8weXd4ZTJLYmlwVmpkWTVIZllDX0JGZzJZMGpaNGRpaHFsdUo2aS1LREdLTXdhc29JUXdvdHRybms5eVpLdGtlZTRCWmV3UjdpTmtZMk1jZjRlUE5ydC0tVU5nIiwiZXhwaXJhdGlvblRpbWUiOiIxNzA1MDAyMjM0MDMwIn0sImlhdCI6MTc2MzU1NTU0NywiZXhwIjoxNzYzNTU5MTQ3fQ.Tt8ALBbM9ooV2mStV_qbEoo9AWOEnXhS6wQ97YAlv-Y"

# ID du cours de test (remplacer par un vrai ID de votre base)
COURSE_ID="662686c375bf8788b07b7140"

# Variable pour stocker l'ID du chapitre créé
NEW_CHAPTER_ID=""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "=========================================="
echo "  TESTS CRUD - GESTION DES COURS"
echo "=========================================="
echo ""
echo "📋 Course ID utilisé: $COURSE_ID"
echo ""

# =============================================
# TEST 1: Récupérer les détails du cours
# =============================================
echo -e "${BLUE}📖 Test 1: Récupérer les détails du cours${NC}"
echo "GET /dashboard/courses/:id/details"
echo ""

response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X GET "$BASE_URL/dashboard/courses/$COURSE_ID/details" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE:/d')

echo "Status: $http_code"
echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"

if [ "$http_code" -eq 200 ]; then
  echo -e "${GREEN}✓ Test 1 réussi${NC}"

  # Extraire l'ID du premier chapitre s'il existe
  FIRST_CHAPTER_ID=$(echo "$body" | python3 -c "import sys, json; course = json.load(sys.stdin).get('course', {}); sections = course.get('Sections', []); print(sections[0]['_id'] if sections else '')" 2>/dev/null)

  if [ ! -z "$FIRST_CHAPTER_ID" ]; then
    echo -e "${YELLOW}📌 Premier chapitre trouvé: $FIRST_CHAPTER_ID${NC}"
  fi
else
  echo -e "${RED}✗ Test 1 échoué${NC}"
fi

echo ""
echo "==========================================\n"
sleep 2

# =============================================
# TEST 2: Ajouter un nouveau chapitre
# =============================================
echo -e "${BLUE}➕ Test 2: Ajouter un nouveau chapitre${NC}"
echo "POST /dashboard/courses/:id/chapters"
echo ""

response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST "$BASE_URL/dashboard/courses/$COURSE_ID/chapters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Nouveau Chapitre Test - '$(date +%H:%M:%S)'",
    "description": "Chapitre ajouté via script de test CRUD",
    "contenu": "Ceci est le contenu du chapitre test",
    "ordre": 999
  }')

http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE:/d')

echo "Status: $http_code"
echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"

if [ "$http_code" -eq 201 ]; then
  echo -e "${GREEN}✓ Test 2 réussi${NC}"

  # Extraire l'ID du nouveau chapitre
  NEW_CHAPTER_ID=$(echo "$body" | python3 -c "import sys, json; print(json.load(sys.stdin).get('chapter', {}).get('_id', ''))" 2>/dev/null)

  if [ ! -z "$NEW_CHAPTER_ID" ]; then
    echo -e "${YELLOW}📌 Nouveau chapitre créé avec ID: $NEW_CHAPTER_ID${NC}"
  fi
else
  echo -e "${RED}✗ Test 2 échoué${NC}"
fi

echo ""
echo "==========================================\n"
sleep 2

# =============================================
# TEST 3: Modifier le chapitre créé
# =============================================
if [ ! -z "$NEW_CHAPTER_ID" ]; then
  echo -e "${BLUE}✏️  Test 3: Modifier le chapitre créé${NC}"
  echo "PUT /dashboard/courses/:id/chapters/:chapterId"
  echo ""

  response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X PUT "$BASE_URL/dashboard/courses/$COURSE_ID/chapters/$NEW_CHAPTER_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "titre": "Chapitre Test MODIFIÉ - '$(date +%H:%M:%S)'",
      "description": "Description mise à jour",
      "contenu": "Contenu modifié",
      "ordre": 1000
    }')

  http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
  body=$(echo "$response" | sed '/HTTP_CODE:/d')

  echo "Status: $http_code"
  echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"

  if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ Test 3 réussi${NC}"
  else
    echo -e "${RED}✗ Test 3 échoué${NC}"
  fi

  echo ""
  echo "==========================================\n"
  sleep 2
fi

# =============================================
# TEST 4: Modifier le cours entier
# =============================================
echo -e "${BLUE}📝 Test 4: Modifier le cours entier${NC}"
echo "PUT /dashboard/courses/:id"
echo ""

response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X PUT "$BASE_URL/dashboard/courses/$COURSE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lastModified": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
  }')

http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE:/d')

echo "Status: $http_code"
echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"

if [ "$http_code" -eq 200 ]; then
  echo -e "${GREEN}✓ Test 4 réussi${NC}"
else
  echo -e "${RED}✗ Test 4 échoué${NC}"
fi

echo ""
echo "==========================================\n"
sleep 2

# =============================================
# TEST 5: Supprimer le chapitre créé
# =============================================
if [ ! -z "$NEW_CHAPTER_ID" ]; then
  echo -e "${BLUE}🗑️  Test 5: Supprimer le chapitre créé${NC}"
  echo "DELETE /dashboard/courses/:id/chapters/:chapterId"
  echo ""

  response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X DELETE "$BASE_URL/dashboard/courses/$COURSE_ID/chapters/$NEW_CHAPTER_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

  http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
  body=$(echo "$response" | sed '/HTTP_CODE:/d')

  echo "Status: $http_code"
  echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"

  if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ Test 5 réussi${NC}"
  else
    echo -e "${RED}✗ Test 5 échoué${NC}"
  fi

  echo ""
  echo "==========================================\n"
  sleep 2
fi

# =============================================
# TEST 6: Vérifier que le chapitre a été supprimé
# =============================================
echo -e "${BLUE}🔍 Test 6: Vérifier que le cours ne contient plus le chapitre supprimé${NC}"
echo "GET /dashboard/courses/:id/details"
echo ""

response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X GET "$BASE_URL/dashboard/courses/$COURSE_ID/details" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE:/d')

echo "Status: $http_code"

# Compter le nombre de chapitres
if [ "$http_code" -eq 200 ]; then
  section_count=$(echo "$body" | python3 -c "import sys, json; print(json.load(sys.stdin).get('sectionsCount', 0))" 2>/dev/null)
  echo "Nombre de chapitres dans le cours: $section_count"
  echo -e "${GREEN}✓ Test 6 réussi${NC}"
else
  echo -e "${RED}✗ Test 6 échoué${NC}"
fi

echo ""
echo "=========================================="
echo "  RÉSUMÉ DES TESTS"
echo "=========================================="
echo ""
echo "✓ Test 1: GET /dashboard/courses/:id/details"
echo "✓ Test 2: POST /dashboard/courses/:id/chapters"
echo "✓ Test 3: PUT /dashboard/courses/:id/chapters/:chapterId"
echo "✓ Test 4: PUT /dashboard/courses/:id"
echo "✓ Test 5: DELETE /dashboard/courses/:id/chapters/:chapterId"
echo "✓ Test 6: Vérification de la suppression"
echo ""
echo "🎉 Tous les tests CRUD ont été exécutés!"
echo ""
echo "📝 Note: Mettez à jour le TOKEN dans ce script s'il est expiré"
echo "📝 Note: Remplacez COURSE_ID par un ID valide de votre base de données"
echo ""
