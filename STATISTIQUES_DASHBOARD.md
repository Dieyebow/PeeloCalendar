# 📊 Endpoints de Statistiques Avancées - Dashboard PeeloCar

**Date**: 2025-11-20
**Version**: 2.0.0

---

## 🎯 Nouveaux Endpoints de Statistiques

### Vue d'ensemble

10 nouveaux endpoints pour des statistiques détaillées du dashboard.

---

## 📈 1. STATISTIQUES TEMPORELLES

### 1.1 Évolution des inscriptions (par mois)

**GET** `/dashboard/stats/inscriptions/monthly`

Retourne le nombre d'inscriptions d'élèves par mois sur les 12 derniers mois.

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/stats/inscriptions/monthly" \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse simulée**:
```json
{
  "success": true,
  "period": "12 derniers mois",
  "data": [
    { "month": "2024-11", "count": 45, "label": "Novembre 2024" },
    { "month": "2024-12", "count": 52, "label": "Décembre 2024" },
    { "month": "2025-01", "count": 38, "label": "Janvier 2025" },
    { "month": "2025-02", "count": 41, "label": "Février 2025" },
    { "month": "2025-03", "count": 47, "label": "Mars 2025" },
    { "month": "2025-04", "count": 55, "label": "Avril 2025" },
    { "month": "2025-05", "count": 62, "label": "Mai 2025" },
    { "month": "2025-06", "count": 58, "label": "Juin 2025" },
    { "month": "2025-07", "count": 43, "label": "Juillet 2025" },
    { "month": "2025-08", "count": 39, "label": "Août 2025" },
    { "month": "2025-09", "count": 51, "label": "Septembre 2025" },
    { "month": "2025-10", "count": 48, "label": "Octobre 2025" }
  ],
  "total": 579,
  "average": 48.25
}
```

---

### 1.2 Tests passés par période

**GET** `/dashboard/stats/tests/timeline`

Retourne le nombre de tests passés par jour sur les 30 derniers jours.

**Paramètres**:
- `days` (query, optional): Nombre de jours (défaut: 30, max: 90)

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/stats/tests/timeline?days=30" \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse simulée**:
```json
{
  "success": true,
  "period": "30 derniers jours",
  "data": [
    { "date": "2025-10-21", "count": 34, "avgScore": 25.4 },
    { "date": "2025-10-22", "count": 41, "avgScore": 26.1 },
    { "date": "2025-10-23", "count": 38, "avgScore": 24.8 },
    "..."
  ],
  "totalTests": 1156,
  "averagePerDay": 38.5,
  "avgScoreGlobal": 25.7
}
```

---

## 🎓 2. STATISTIQUES DE PERFORMANCE

### 2.1 Taux de réussite global

**GET** `/dashboard/stats/performance/success-rate`

Calcule les taux de réussite aux tests (score >= 25/30).

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/stats/performance/success-rate" \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse simulée**:
```json
{
  "success": true,
  "globalStats": {
    "totalTests": 3542,
    "successfulTests": 2187,
    "failedTests": 1355,
    "successRate": 61.74,
    "passThreshold": 25
  },
  "byQuizz": [
    {
      "quizzId": "659816b89f5a6dc6bc104db0",
      "quizzName": "Code de la route - Série 1",
      "totalTests": 234,
      "successRate": 68.5,
      "avgScore": 26.3
    },
    "..."
  ],
  "byAutoecole": [
    {
      "autoecoleId": "659816a89f5a6dc6bc104da5",
      "autoecoleName": "Auto-École Mojay",
      "totalTests": 856,
      "successRate": 64.2,
      "avgScore": 25.9
    },
    "..."
  ]
}
```

---

### 2.2 Progression des élèves

**GET** `/dashboard/stats/performance/progression`

Analyse la progression des élèves (amélioration des scores).

**Paramètres**:
- `minTests` (query, optional): Nombre minimum de tests (défaut: 3)

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/stats/performance/progression?minTests=3" \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse simulée**:
```json
{
  "success": true,
  "summary": {
    "totalStudents": 456,
    "studentsAnalyzed": 342,
    "improving": 198,
    "stable": 89,
    "declining": 55,
    "avgProgression": 2.3
  },
  "topImprovers": [
    {
      "tel": "781234567",
      "name": "Fatou FALL",
      "firstScore": 18,
      "lastScore": 28,
      "improvement": 10,
      "testsCount": 8
    },
    "..."
  ],
  "categories": {
    "excellent": { "count": 45, "label": "Progression > 5 points" },
    "good": { "count": 153, "label": "Progression 2-5 points" },
    "stable": { "count": 89, "label": "Stable (±1 point)" },
    "needHelp": { "count": 55, "label": "Déclin > 2 points" }
  }
}
```

---

### 2.3 Quiz les plus difficiles

**GET** `/dashboard/stats/performance/difficult-quizz`

Identifie les quiz avec les scores moyens les plus faibles.

**Paramètres**:
- `limit` (query, optional): Nombre de quiz à retourner (défaut: 10)

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/stats/performance/difficult-quizz?limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse simulée**:
```json
{
  "success": true,
  "difficultQuizz": [
    {
      "quizzId": "659816c89f5a6dc6bc104dc1",
      "quizzName": "Code de la route - Série 8",
      "avgScore": 19.2,
      "testsCount": 145,
      "successRate": 34.5,
      "questionsCount": 30,
      "difficulty": "Très difficile"
    },
    {
      "quizzId": "659816c89f5a6dc6bc104dc2",
      "quizzName": "Signalisation avancée",
      "avgScore": 21.5,
      "testsCount": 89,
      "successRate": 42.7,
      "questionsCount": 30,
      "difficulty": "Difficile"
    },
    "..."
  ]
}
```

---

## 👥 3. STATISTIQUES D'ENGAGEMENT

### 3.1 Élèves actifs vs inactifs

**GET** `/dashboard/stats/engagement/activity`

Analyse l'activité des élèves (dernière activité).

**Paramètres**:
- `inactiveDays` (query, optional): Jours sans activité = inactif (défaut: 30)

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/stats/engagement/activity?inactiveDays=30" \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse simulée**:
```json
{
  "success": true,
  "totalStudents": 456,
  "active": {
    "count": 287,
    "percentage": 62.9,
    "label": "Actifs (< 30 jours)"
  },
  "inactive": {
    "count": 169,
    "percentage": 37.1,
    "label": "Inactifs (> 30 jours)"
  },
  "breakdown": {
    "veryActive": { "count": 134, "label": "< 7 jours", "percentage": 29.4 },
    "active": { "count": 153, "label": "7-30 jours", "percentage": 33.5 },
    "inactive": { "count": 98, "label": "30-90 jours", "percentage": 21.5 },
    "veryInactive": { "count": 71, "label": "> 90 jours", "percentage": 15.6 }
  },
  "recentActivity": [
    { "period": "Aujourd'hui", "studentsActive": 45 },
    { "period": "Cette semaine", "studentsActive": 187 },
    { "period": "Ce mois", "studentsActive": 287 }
  ]
}
```

---

### 3.2 Taux de complétion des cours

**GET** `/dashboard/stats/engagement/course-completion`

Analyse le taux de complétion des cours par les élèves.

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/stats/engagement/course-completion" \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse simulée**:
```json
{
  "success": true,
  "summary": {
    "totalCourses": 18,
    "totalEnrollments": 2456,
    "completedEnrollments": 1234,
    "avgCompletionRate": 50.2
  },
  "byCourse": [
    {
      "courseId": "662686c375bf8788b07b7140",
      "courseName": "Code de la route - Module 1",
      "totalSections": 8,
      "enrollments": 234,
      "completed": 156,
      "completionRate": 66.7,
      "avgTimeToComplete": "12 jours"
    },
    "..."
  ],
  "completionDistribution": {
    "notStarted": { "count": 145, "percentage": 5.9 },
    "inProgress": { "count": 1077, "percentage": 43.9 },
    "completed": { "count": 1234, "percentage": 50.2 }
  }
}
```

---

### 3.3 Temps moyen d'étude

**GET** `/dashboard/stats/engagement/study-time`

Calcule le temps moyen passé par les élèves.

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/stats/engagement/study-time" \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse simulée**:
```json
{
  "success": true,
  "globalAverage": {
    "avgTestsPerStudent": 7.8,
    "avgTimePerTest": "15 minutes",
    "totalStudyTime": "2h",
    "medianTestsCount": 6
  },
  "distribution": {
    "veryEngaged": { "count": 89, "label": "> 15 tests", "percentage": 19.5 },
    "engaged": { "count": 187, "label": "8-15 tests", "percentage": 41.0 },
    "moderate": { "count": 123, "label": "4-7 tests", "percentage": 27.0 },
    "low": { "count": 57, "label": "< 4 tests", "percentage": 12.5 }
  },
  "topStudents": [
    {
      "tel": "781234567",
      "name": "Fatou FALL",
      "testsCount": 28,
      "avgScore": 27.5,
      "studyTime": "7h"
    },
    "..."
  ]
}
```

---

## 🏫 4. STATISTIQUES PAR AUTO-ÉCOLE

### 4.1 Classement des auto-écoles

**GET** `/dashboard/stats/autoecoles/ranking`

Classe les auto-écoles par performance.

**Paramètres**:
- `metric` (query, optional): Métrique de classement (students|performance|activity) (défaut: performance)

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/stats/autoecoles/ranking?metric=performance" \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse simulée**:
```json
{
  "success": true,
  "metric": "performance",
  "ranking": [
    {
      "rank": 1,
      "autoecoleId": "659816a89f5a6dc6bc104da5",
      "autoecoleName": "Auto-École Mojay",
      "studentsCount": 156,
      "avgScore": 27.2,
      "successRate": 72.4,
      "testsCount": 1234,
      "activeStudents": 98,
      "badge": "🥇 Excellence"
    },
    {
      "rank": 2,
      "autoecoleId": "659816a89f5a6dc6bc104da6",
      "autoecoleName": "Peelo Car Formation",
      "studentsCount": 134,
      "avgScore": 26.8,
      "successRate": 68.9,
      "testsCount": 987,
      "activeStudents": 87,
      "badge": "🥈 Très bien"
    },
    "..."
  ]
}
```

---

### 4.2 Comparaison entre auto-écoles

**GET** `/dashboard/stats/autoecoles/comparison`

Compare les métriques de toutes les auto-écoles.

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/stats/autoecoles/comparison" \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse simulée**:
```json
{
  "success": true,
  "autoecoles": [
    {
      "autoecoleId": "659816a89f5a6dc6bc104da5",
      "autoecoleName": "Auto-École Mojay",
      "metrics": {
        "students": 156,
        "activeStudents": 98,
        "activityRate": 62.8,
        "avgScore": 27.2,
        "successRate": 72.4,
        "testsCount": 1234,
        "avgTestsPerStudent": 7.9
      }
    },
    "..."
  ],
  "averages": {
    "avgStudentsPerAutoecole": 57,
    "avgActivityRate": 58.3,
    "avgSuccessRate": 61.7,
    "avgScore": 25.7
  },
  "bestPerformers": {
    "mostStudents": "Auto-École Mojay",
    "highestScore": "Auto-École Mojay",
    "bestSuccessRate": "Peelo Car Formation",
    "mostActive": "Dakar Driving School"
  }
}
```

---

## 📊 5. STATISTIQUES ADMINISTRATIVES

### 5.1 Répartition Premium vs Standard

**GET** `/dashboard/stats/admin/premium-distribution`

Analyse la répartition des élèves premium vs standard.

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/stats/admin/premium-distribution" \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse simulée**:
```json
{
  "success": true,
  "totalStudents": 456,
  "premium": {
    "count": 178,
    "percentage": 39.0,
    "avgScore": 27.8,
    "avgTests": 9.4,
    "successRate": 74.2
  },
  "standard": {
    "count": 278,
    "percentage": 61.0,
    "avgScore": 24.6,
    "avgTests": 6.7,
    "successRate": 54.3
  },
  "comparison": {
    "scoreDifference": 3.2,
    "testsDifference": 2.7,
    "successRateDifference": 19.9
  },
  "trends": {
    "premiumGrowth": "+12% ce mois",
    "conversionRate": "8.5%"
  }
}
```

---

### 5.2 Distribution par statut de permis

**GET** `/dashboard/stats/admin/license-status`

Analyse les élèves par statut de permis.

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/stats/admin/license-status" \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse simulée**:
```json
{
  "success": true,
  "totalStudents": 456,
  "withLicense": {
    "count": 128,
    "percentage": 28.1,
    "avgScore": 28.3,
    "label": "Ont le permis"
  },
  "withoutLicense": {
    "count": 328,
    "percentage": 71.9,
    "avgScore": 24.9,
    "label": "N'ont pas le permis"
  },
  "readyForExam": {
    "count": 87,
    "percentage": 19.1,
    "criteria": "Score moyen > 26 sur 5 derniers tests",
    "label": "Prêts pour l'examen"
  },
  "needMorePractice": {
    "count": 241,
    "percentage": 52.9,
    "label": "Nécessitent plus de pratique"
  }
}
```

---

## 🎯 6. TABLEAU DE BORD GLOBAL

### 6.1 Vue d'ensemble complète

**GET** `/dashboard/stats/overview`

Retourne toutes les statistiques principales en une seule requête (optimisé pour dashboard principal).

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/stats/overview" \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse simulée**:
```json
{
  "success": true,
  "timestamp": "2025-11-20T14:30:00.000Z",
  "overview": {
    "students": {
      "total": 456,
      "active": 287,
      "newThisMonth": 48,
      "premium": 178,
      "growth": "+12.5%"
    },
    "autoecoles": {
      "total": 8,
      "active": 7,
      "avgStudentsPerAutoecole": 57
    },
    "tests": {
      "total": 3542,
      "thisMonth": 342,
      "avgScore": 25.7,
      "successRate": 61.74
    },
    "courses": {
      "total": 18,
      "avgCompletionRate": 50.2,
      "totalEnrollments": 2456
    },
    "quizz": {
      "total": 25,
      "mostPopular": "Code de la route - Série 1",
      "avgAttemptsPerQuizz": 141.7
    }
  },
  "trends": {
    "inscriptions": {
      "thisMonth": 48,
      "lastMonth": 51,
      "change": -5.9,
      "trend": "stable"
    },
    "activity": {
      "testsToday": 45,
      "testsThisWeek": 287,
      "avgTestsPerDay": 41
    },
    "performance": {
      "avgScore": 25.7,
      "lastMonth": 25.3,
      "change": +1.6,
      "trend": "improving"
    }
  },
  "alerts": [
    {
      "type": "warning",
      "message": "169 élèves inactifs depuis plus de 30 jours",
      "action": "Envoyer rappels"
    },
    {
      "type": "success",
      "message": "87 élèves prêts pour l'examen",
      "action": "Planifier examens"
    }
  ]
}
```

---

## 📋 Résumé des Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/dashboard/stats/inscriptions/monthly` | GET | Inscriptions par mois |
| `/dashboard/stats/tests/timeline` | GET | Tests par jour |
| `/dashboard/stats/performance/success-rate` | GET | Taux de réussite |
| `/dashboard/stats/performance/progression` | GET | Progression élèves |
| `/dashboard/stats/performance/difficult-quizz` | GET | Quiz difficiles |
| `/dashboard/stats/engagement/activity` | GET | Activité élèves |
| `/dashboard/stats/engagement/course-completion` | GET | Complétion cours |
| `/dashboard/stats/engagement/study-time` | GET | Temps d'étude |
| `/dashboard/stats/autoecoles/ranking` | GET | Classement auto-écoles |
| `/dashboard/stats/autoecoles/comparison` | GET | Comparaison auto-écoles |
| `/dashboard/stats/admin/premium-distribution` | GET | Distribution premium |
| `/dashboard/stats/admin/license-status` | GET | Statut permis |
| `/dashboard/stats/overview` | GET | Vue d'ensemble complète |

**Total: 13 nouveaux endpoints de statistiques**

---

## 🎨 Suggestions d'Utilisation dans le Frontend

### Dashboard Principal
```javascript
// Charger la vue d'ensemble
const overview = await fetch('/dashboard/stats/overview');

// Widgets recommandés:
// - Cartes KPI (students, tests, success rate)
// - Graphique ligne: inscriptions mensuelles
// - Graphique barre: tests par jour
// - Tableau: classement auto-écoles
// - Alertes: élèves inactifs, prêts pour examen
```

### Page Performance
```javascript
// Taux de réussite + progression + quiz difficiles
const successRate = await fetch('/dashboard/stats/performance/success-rate');
const progression = await fetch('/dashboard/stats/performance/progression');
const difficult = await fetch('/dashboard/stats/performance/difficult-quizz');
```

### Page Engagement
```javascript
// Activité + complétion + temps d'étude
const activity = await fetch('/dashboard/stats/engagement/activity');
const completion = await fetch('/dashboard/stats/engagement/course-completion');
const studyTime = await fetch('/dashboard/stats/engagement/study-time');
```

---

**Prêt à implémenter ces endpoints dans peelocarDashboard.js!**
