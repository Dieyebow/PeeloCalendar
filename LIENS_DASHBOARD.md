# 🔗 Liens de Requêtes - Tableau de Bord PeeloCar

## Configuration
- **Base URL**: `http://localhost:7568`
- **Authentification**: Header `Authorization: Bearer <TOKEN>`
- **Format**: JSON

---

## 🏥 Health Check (Sans Auth)

```
GET http://localhost:7568/dashboard/health
```
**Retour**: Status de l'API + timestamp

---

## 📊 VUE D'ENSEMBLE - KPIs Globaux

### KPIs Principaux (Recommandé pour le dashboard principal)
```
GET http://localhost:7568/dashboard/kpis/global
```
**Retour**: Tous les KPIs en une seule requête
- Total auto-écoles
- Total élèves
- Total quiz
- Total cours
- Total tests effectués
- Élèves sans permis

---

## 👥 UTILISATEURS ADMIN

### Nombre d'administrateurs
```
GET http://localhost:7568/dashboard/users/count
```

### Liste des administrateurs
```
GET http://localhost:7568/dashboard/users/list?page=1&limit=10
```

---

## 🏫 AUTO-ÉCOLES

### Nombre total d'auto-écoles
```
GET http://localhost:7568/dashboard/autoecoles/count
```

### Liste des auto-écoles
```
GET http://localhost:7568/dashboard/autoecoles/list?page=1&limit=10
```

### Statistiques par auto-école (avec nombre d'élèves)
```
GET http://localhost:7568/dashboard/autoecoles/stats
```
**Utilisation**: Afficher un tableau trié par nombre d'élèves

### Élèves d'une auto-école spécifique
```
GET http://localhost:7568/dashboard/autoecoles/{ID_AUTOECOLE}/students
```
**Exemple**: `/dashboard/autoecoles/659816a89f5a6dc6bc104da5/students`

---

## 🎓 ÉLÈVES

### Vue d'ensemble des élèves

#### Nombre total d'élèves
```
GET http://localhost:7568/dashboard/students/count
```

#### Liste paginée des élèves
```
GET http://localhost:7568/dashboard/students/list?page=1&limit=10
```

#### Recherche d'élèves
```
GET http://localhost:7568/dashboard/students/list?page=1&limit=10&search=Fatou
```
**Recherche sur**: nom, téléphone, auto-école

### Filtres spéciaux

#### Élèves premium
```
GET http://localhost:7568/dashboard/students/premium?page=1&limit=10
```
**Critère**: tel_autoecole = 787570707

#### Élèves actifs récemment
```
GET http://localhost:7568/dashboard/students/active
```
**Retour**: Élèves ayant interagi avec le chatbot récemment

#### Élèves par auto-école
```
GET http://localhost:7568/dashboard/students/by-autoecole/{ID_AUTOECOLE}?page=1&limit=10
```

### Statistiques temporelles

#### Nouvelles inscriptions par date
```
GET http://localhost:7568/dashboard/students/by-date
```
**Utilisation**: Graphique de croissance

---

## 📝 QUIZ

### Vue d'ensemble des quiz

#### Nombre total de quiz
```
GET http://localhost:7568/dashboard/quizz/count
```

#### Liste des quiz
```
GET http://localhost:7568/dashboard/quizz/list
```
**Retour**: Tous les quiz avec nombre de questions

#### Détails d'un quiz spécifique
```
GET http://localhost:7568/dashboard/quizz/{ID_QUIZ}/details
```
**Retour**: Toutes les questions du quiz

### Statistiques

#### Stats globales des quiz
```
GET http://localhost:7568/dashboard/quizz/stats
```
**Retour**:
- Total quiz
- Total questions
- Moyenne questions/quiz
- Min/Max questions

#### Quiz les plus populaires
```
GET http://localhost:7568/dashboard/quizz/popular?limit=10
```
**Utilisation**: Afficher les quiz les plus utilisés
**Retour**: Quiz triés par nombre de tests + score moyen

---

## ✅ RÉSULTATS DES TESTS

### Vue d'ensemble

#### Nombre total de tests effectués
```
GET http://localhost:7568/dashboard/tests/count
```

#### Statistiques globales des tests
```
GET http://localhost:7568/dashboard/tests/stats
```
**Retour**:
- Total tests
- Score moyen
- Score max/min
- Total réponses

### Tests par entité

#### Tests d'un élève spécifique
```
GET http://localhost:7568/dashboard/tests/by-student/{TELEPHONE}
```
**Exemple**: `/dashboard/tests/by-student/781234567`

#### Tests pour un quiz spécifique
```
GET http://localhost:7568/dashboard/tests/by-quiz/{ID_QUIZ}
```

### Classements et Activité récente

#### Tests récents
```
GET http://localhost:7568/dashboard/tests/recent?limit=20
```
**Utilisation**: Timeline d'activité
**Retour**: Derniers tests avec nom élève, score, auto-école

#### Classement des meilleurs élèves (Leaderboard)
```
GET http://localhost:7568/dashboard/tests/leaderboard?limit=10
```
**Utilisation**: Top 10 des meilleurs élèves
**Retour**: Meilleur score, nombre de tests, score moyen

---

## 📚 COURS

### Vue d'ensemble

#### Nombre total de cours
```
GET http://localhost:7568/dashboard/courses/count
```

#### Liste des cours
```
GET http://localhost:7568/dashboard/courses/list
```
**Retour**: Tous les cours avec nombre de chapitres

#### Détails d'un cours
```
GET http://localhost:7568/dashboard/courses/{ID_COURS}/details
```
**Retour**: Toutes les sections du cours

### Statistiques

#### Stats globales des cours
```
GET http://localhost:7568/dashboard/courses/stats
```
**Retour**:
- Total cours
- Total sections
- Moyenne sections/cours
- Min/Max sections

---

## 📈 KPIs & ANALYTICS

### Vue globale (Recommandé)
```
GET http://localhost:7568/dashboard/kpis/global
```

### Engagement des élèves
```
GET http://localhost:7568/dashboard/kpis/engagement?page=1&limit=10
```
**Retour**: Messages par utilisateur, jours actifs

### Performance aux quiz
```
GET http://localhost:7568/dashboard/kpis/performance
```
**Retour**: Taux de réussite moyen, total tests/questions

### Croissance (Nouveaux élèves)
```
GET http://localhost:7568/dashboard/kpis/growth
```
**Retour**: Nombre de nouveaux élèves par jour

---

## 🎯 SUGGESTIONS D'UTILISATION DANS LE DASHBOARD

### Page d'accueil - Dashboard Principal

**Section 1: Cartes KPIs (4 cartes)**
```
GET /dashboard/kpis/global
```
Afficher:
- 🏫 Total Auto-écoles
- 🎓 Total Élèves
- 📝 Total Quiz
- ✅ Total Tests

**Section 2: Graphique de croissance**
```
GET /dashboard/kpis/growth
```
Afficher un graphique linéaire des nouvelles inscriptions

**Section 3: Activité récente**
```
GET /dashboard/tests/recent?limit=10
```
Timeline des 10 derniers tests effectués

**Section 4: Top performers**
```
GET /dashboard/tests/leaderboard?limit=5
```
Classement des 5 meilleurs élèves

### Page Auto-écoles

**Tableau des auto-écoles**
```
GET /dashboard/autoecoles/stats
```
Colonnes: Nom, Téléphone, Admin, Nb Élèves

**Détails auto-école (au clic)**
```
GET /dashboard/autoecoles/{ID}/students
```

### Page Élèves

**Liste avec recherche et filtres**
```
# Liste normale
GET /dashboard/students/list?page=1&limit=20

# Avec recherche
GET /dashboard/students/list?page=1&limit=20&search=Fatou

# Seulement premium
GET /dashboard/students/premium?page=1&limit=20
```

**Stats élèves**
```
GET /dashboard/students/count
GET /dashboard/students/by-date
GET /dashboard/students/active
```

### Page Quiz

**Liste des quiz avec popularité**
```
GET /dashboard/quizz/list
GET /dashboard/quizz/popular?limit=10
```

**Statistiques quiz**
```
GET /dashboard/quizz/stats
```

**Détails quiz (au clic)**
```
GET /dashboard/quizz/{ID}/details
GET /dashboard/tests/by-quiz/{ID}
```

### Page Performance

**Statistiques globales**
```
GET /dashboard/kpis/performance
GET /dashboard/tests/stats
```

**Classement complet**
```
GET /dashboard/tests/leaderboard?limit=50
```

### Page Cours

**Liste et stats**
```
GET /dashboard/courses/list
GET /dashboard/courses/stats
```

**Détails cours (au clic)**
```
GET /dashboard/courses/{ID}/details
```

---

## 💡 EXEMPLES DE WIDGETS

### Widget 1: Carte KPI Simple
```javascript
// Requête
GET /dashboard/students/count

// Réponse
{
  "success": true,
  "count": 456
}

// Affichage
┌─────────────────┐
│ 🎓 ÉLÈVES       │
│                 │
│     456         │
│                 │
│ +12% ce mois    │
└─────────────────┘
```

### Widget 2: Classement Top 5
```javascript
// Requête
GET /dashboard/tests/leaderboard?limit=5

// Réponse
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
    },
    // ...
  ]
}

// Affichage
🏆 TOP 5 ÉLÈVES
1. Fatou FALL - 30/30 (27.5 moy) 🥇
2. Moussa SARR - 29/30 (26.8 moy) 🥈
3. Awa DIOP - 28/30 (25.2 moy) 🥉
4. Ibrahima BA - 27/30 (24.8 moy)
5. Aissatou SY - 27/30 (24.1 moy)
```

### Widget 3: Tests récents (Timeline)
```javascript
// Requête
GET /dashboard/tests/recent?limit=5

// Réponse
{
  "success": true,
  "recentTests": [
    {
      "tel": "781234567",
      "score": 25,
      "created_at": "2025-11-19T10:30:00.000Z",
      "answers": 30,
      "student_name": "Fatou FALL",
      "autoecole": "Auto-École Mojay"
    },
    // ...
  ]
}

// Affichage
📋 ACTIVITÉ RÉCENTE
• Il y a 5 min - Fatou FALL a obtenu 25/30
• Il y a 12 min - Moussa SARR a obtenu 28/30
• Il y a 18 min - Awa DIOP a obtenu 22/30
• Il y a 25 min - Ibrahima BA a obtenu 26/30
• Il y a 32 min - Aissatou SY a obtenu 24/30
```

### Widget 4: Graphique Croissance
```javascript
// Requête
GET /dashboard/kpis/growth

// Réponse
{
  "success": true,
  "growthData": [
    { "date": "2025-11-10", "count": 15 },
    { "date": "2025-11-11", "count": 22 },
    { "date": "2025-11-12", "count": 18 },
    // ...
  ]
}

// Affichage (graphique linéaire)
Nouveaux élèves
22 │     ●
   │    ╱  ╲
18 │   ╱    ●
   │  ╱
15 │ ●
   └─────────────
   10  11  12
      Nov 2025
```

---

## 🔧 CONFIGURATION FRONTEND

### Headers requis
```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
};
```

### Gestion des erreurs
```javascript
// 401 Unauthorized -> Rediriger vers login
// 403 Forbidden -> Token expiré, rafraîchir le token
// 404 Not Found -> Ressource inexistante
// 500 Internal Server Error -> Erreur serveur
```

### Refresh automatique
```javascript
// Rafraîchir les données toutes les 30 secondes
setInterval(() => {
  fetchDashboardData();
}, 30000);
```

---

## ✅ CHECKLIST D'INTÉGRATION

- [ ] Configurer l'URL de base de l'API
- [ ] Implémenter la gestion du token JWT
- [ ] Créer les composants pour les cartes KPI
- [ ] Créer les composants pour les tableaux
- [ ] Créer les composants pour les graphiques
- [ ] Implémenter la pagination
- [ ] Implémenter la recherche/filtres
- [ ] Gérer les erreurs et états de chargement
- [ ] Tester avec des données réelles
- [ ] Optimiser les performances (cache, lazy loading)

---

**Développé pour PeeloCar Dashboard**
**Version**: 1.0.0
**Date**: 2025-11-19
