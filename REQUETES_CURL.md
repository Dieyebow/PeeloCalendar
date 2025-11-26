# 🔗 Requêtes CURL - API Dashboard PeeloCar

**URL Production**: `https://autoecole.mojay.pro`
**Date**: 2025-11-19

---

## ⚠️ Important: Token JWT

Pour utiliser ces requêtes, vous devez d'abord définir votre token JWT:

```bash
TOKEN="VOTRE_TOKEN_JWT_ICI"
```

Le token actuel dans les scripts est expiré. Pour obtenir un nouveau token:
1. Connectez-vous sur l'application
2. Ouvrez les DevTools (F12) > Network
3. Copiez le token depuis les headers d'une requête authentifiée

---

## 🏥 1. HEALTH CHECK (Sans Auth)

```bash
curl https://autoecole.mojay.pro/dashboard/health
```

**Résultat attendu**:
```json
{
  "success": true,
  "message": "PeeloCar Dashboard API is running",
  "timestamp": "2025-11-19T14:59:57.640Z"
}
```

---

## 📊 2. KPIS GLOBAUX (Recommandé pour le dashboard)

```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/kpis/global
```

**Retour**: Total auto-écoles, élèves, quiz, cours, tests, élèves sans permis

---

## 🏫 3. AUTO-ÉCOLES

### Nombre total d'auto-écoles
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/autoecoles/count
```

### Liste des auto-écoles
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://autoecole.mojay.pro/dashboard/autoecoles/list?page=1&limit=10"
```

### Statistiques des auto-écoles (avec nb élèves)
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/autoecoles/stats
```

### Élèves d'une auto-école spécifique
```bash
# Remplacer {ID} par l'ID de l'auto-école
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/autoecoles/{ID}/students
```

---

## 🎓 4. ÉLÈVES

### Nombre total d'élèves
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/students/count
```

### Liste des élèves (avec pagination)
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://autoecole.mojay.pro/dashboard/students/list?page=1&limit=10"
```

### Recherche d'élèves
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://autoecole.mojay.pro/dashboard/students/list?page=1&limit=10&search=Fatou"
```

### Élèves premium uniquement
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://autoecole.mojay.pro/dashboard/students/premium?page=1&limit=10"
```

### Élèves actifs récemment
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/students/active
```

### Nouvelles inscriptions par date
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/students/by-date
```

### Élèves par auto-école
```bash
# Remplacer {ID} par l'ID de l'auto-école
curl -H "Authorization: Bearer $TOKEN" \
  "https://autoecole.mojay.pro/dashboard/students/by-autoecole/{ID}?page=1&limit=10"
```

---

## 📝 5. QUIZ

### Nombre total de quiz
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/quizz/count
```

### Liste des quiz
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/quizz/list
```

### Détails d'un quiz spécifique
```bash
# Remplacer {ID} par l'ID du quiz
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/quizz/{ID}/details
```

### Statistiques des quiz
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/quizz/stats
```

### Quiz les plus populaires
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://autoecole.mojay.pro/dashboard/quizz/popular?limit=10"
```

---

## ✅ 6. RÉSULTATS DES TESTS

### Nombre total de tests
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/tests/count
```

### Tests d'un élève spécifique
```bash
# Remplacer {TEL} par le numéro de téléphone
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/tests/by-student/{TEL}
```

### Tests pour un quiz spécifique
```bash
# Remplacer {ID} par l'ID du quiz
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/tests/by-quiz/{ID}
```

### Statistiques globales des tests
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/tests/stats
```

### Tests récents (derniers 20)
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://autoecole.mojay.pro/dashboard/tests/recent?limit=20"
```

### Classement des meilleurs élèves (Top 10)
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://autoecole.mojay.pro/dashboard/tests/leaderboard?limit=10"
```

---

## 📚 7. COURS

### Nombre total de cours
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/courses/count
```

### Liste des cours
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/courses/list
```

### Détails d'un cours spécifique
```bash
# Remplacer {ID} par l'ID du cours
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/courses/{ID}/details
```

### Statistiques des cours
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/courses/stats
```

---

## 📈 8. KPIS & ANALYTICS

### Vue globale (recommandé)
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/kpis/global
```

### Engagement des élèves
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://autoecole.mojay.pro/dashboard/kpis/engagement?page=1&limit=10"
```

### Performance aux quiz
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/kpis/performance
```

### Croissance (nouveaux élèves par jour)
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/kpis/growth
```

---

## 👥 9. UTILISATEURS ADMIN

### Nombre d'administrateurs
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/users/count
```

### Liste des administrateurs
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://autoecole.mojay.pro/dashboard/users/list?page=1&limit=10"
```

---

## 🚀 SCRIPT DE TEST COMPLET

Créez un fichier `test_api.sh` avec ce contenu:

```bash
#!/bin/bash

# Définir votre token
TOKEN="VOTRE_TOKEN_JWT"

# Base URL
BASE="https://autoecole.mojay.pro"

echo "=== Tests API Dashboard PeeloCar ==="
echo ""

echo "1. Health Check:"
curl -s "$BASE/dashboard/health" | python3 -m json.tool
echo -e "\n"

echo "2. KPIs Globaux:"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/dashboard/kpis/global" | python3 -m json.tool
echo -e "\n"

echo "3. Nombre d'auto-écoles:"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/dashboard/autoecoles/count" | python3 -m json.tool
echo -e "\n"

echo "4. Nombre d'élèves:"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/dashboard/students/count" | python3 -m json.tool
echo -e "\n"

echo "5. Liste des quiz:"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/dashboard/quizz/list" | python3 -m json.tool | head -30
echo -e "\n"

echo "6. Tests récents:"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/dashboard/tests/recent?limit=5" | python3 -m json.tool
echo -e "\n"

echo "7. Classement top 5:"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/dashboard/tests/leaderboard?limit=5" | python3 -m json.tool
echo -e "\n"

echo "=== Tests terminés ==="
```

Puis exécutez:
```bash
chmod +x test_api.sh
./test_api.sh
```

---

## 📊 EXEMPLES DE RÉPONSES

### Health Check
```json
{
  "success": true,
  "message": "PeeloCar Dashboard API is running",
  "timestamp": "2025-11-19T15:00:00.000Z"
}
```

### KPIs Globaux
```json
{
  "success": true,
  "kpis": {
    "totalAutoecoles": 8,
    "totalStudents": 456,
    "totalQuizz": 25,
    "totalCourses": 18,
    "totalTests": 3542,
    "studentsWithoutPermis": 328
  }
}
```

### Nombre d'élèves
```json
{
  "success": true,
  "count": 456
}
```

### Classement Top 5
```json
{
  "success": true,
  "leaderboard": [
    {
      "tel": "781234567",
      "student_name": "Fatou FALL",
      "autoecole": "Auto-École Mojay",
      "bestScore": 30,
      "totalTests": 15,
      "avgScore": 27.5
    }
  ]
}
```

---

## 💡 CONSEILS D'UTILISATION

### 1. Enregistrer les résultats dans un fichier
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/kpis/global \
  > resultats_kpis.json
```

### 2. Formatter le JSON
```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/kpis/global \
  | python3 -m json.tool
```

### 3. Extraire une valeur spécifique (avec jq)
```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/students/count \
  | jq '.count'
```

### 4. Tests en boucle
```bash
while true; do
  curl -s -H "Authorization: Bearer $TOKEN" \
    https://autoecole.mojay.pro/dashboard/students/active | jq
  sleep 30
done
```

---

## 🔧 Dépannage

### Erreur 403 Forbidden
- **Cause**: Token JWT expiré
- **Solution**: Générer un nouveau token

### Erreur 401 Unauthorized
- **Cause**: Token manquant ou invalide
- **Solution**: Vérifier que le header Authorization est bien présent

### Erreur 500 Internal Server Error
- **Cause**: Erreur serveur
- **Solution**: Vérifier les logs PM2: `pm2 logs autoecole`

---

**Tous les endpoints sont maintenant documentés et prêts à être utilisés !**

Mettez à jour le `TOKEN` et lancez vos tests.
