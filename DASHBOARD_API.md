# 📊 PeeloCar Dashboard API - Documentation Complète

## Vue d'ensemble
API REST pour le tableau de bord PeeloCar. Toutes les routes nécessitent une authentification JWT via le header `Authorization: Bearer <token>`.

**Base URL**: `http://localhost:7568`
**Port**: 7568 (intégré dans autoecole.js)
**Authentification**: JWT Token dans header Authorization

---

## 🔐 Authentification

Toutes les routes (sauf `/dashboard/health`) nécessitent un token JWT valide.

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 Table des matières

1. [AUTOECOLE_USER - Utilisateurs Admin](#1-autoecole_user---utilisateurs-admin)
2. [AUTOECOLES - Auto-écoles](#2-autoecoles---auto-écoles)
3. [AUTOECOLES_CURRENT_USER - Élèves](#3-autoecoles_current_user---élèves)
4. [AUTOECOLES_QUIZZ - Quiz](#4-autoecoles_quizz---quiz)
5. [AUTOECOLES_QUIZZ_TEST - Résultats Tests](#5-autoecoles_quizz_test---résultats-tests)
6. [AUTOECOLES_COURSES - Cours](#6-autoecoles_courses---cours)
7. [KPIs et Statistiques](#7-kpis-et-statistiques)

---

## 1. AUTOECOLE_USER - Utilisateurs Admin

### 1.1 Nombre total d'utilisateurs admin

**GET** `/dashboard/users/count`

Retourne le nombre total d'administrateurs/moniteurs dans le système.

**Paramètres**: Aucun

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/users/count" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "count": 15
}
```

---

### 1.2 Liste des utilisateurs admin

**GET** `/dashboard/users/list`

Retourne la liste paginée de tous les administrateurs.

**Paramètres**:
- `page` (query, optional): Numéro de page (défaut: 1)
- `limit` (query, optional): Nombre d'éléments par page (défaut: 10)

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/users/list?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "users": [
    {
      "_id": "65a03b6e2f704c698db2bba6",
      "displayName": "Mamadou DIEYE",
      "email": "dieyebow@gmail.com",
      "tel": "+221763357034",
      "created_at": "2024-01-11T10:25:45.319Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 15
  }
}
```

---

## 2. AUTOECOLES - Auto-écoles

### 2.1 Nombre total d'auto-écoles

**GET** `/dashboard/autoecoles/count`

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/autoecoles/count" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "count": 8
}
```

---

### 2.2 Liste des auto-écoles

**GET** `/dashboard/autoecoles/list`

**Paramètres**:
- `page` (query, optional): Numéro de page
- `limit` (query, optional): Nombre d'éléments par page

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/autoecoles/list?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "autoecoles": [
    {
      "_id": "659816a89f5a6dc6bc104da5",
      "nomAutoecole": "Auto-École Mojay",
      "phoneNumber": "787570707",
      "Admin_displayName": "Mamadou DIEYE",
      "Admin_email": "dieyebow@gmail.com",
      "created_at": "2024-01-05T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8
  }
}
```

---

### 2.3 Élèves par auto-école

**GET** `/dashboard/autoecoles/:id/students`

Retourne tous les élèves inscrits dans une auto-école spécifique.

**Paramètres**:
- `id` (path, required): ID de l'auto-école

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/autoecoles/659816a89f5a6dc6bc104da5/students" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "autoecole_id": "659816a89f5a6dc6bc104da5",
  "students": [
    {
      "_id": "67850b8edccb5bc0fc311a49",
      "fullname": "Fatou FALL",
      "tel": "781234567",
      "name_autoecole": "Auto-École Mojay",
      "tel_autoecole": "787570707",
      "created_at": "2024-11-10T08:15:00.000Z"
    }
  ],
  "count": 142
}
```

---

### 2.4 Statistiques des auto-écoles

**GET** `/dashboard/autoecoles/stats`

Retourne les statistiques détaillées avec le nombre d'élèves par auto-école.

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/autoecoles/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "stats": [
    {
      "_id": "659816a89f5a6dc6bc104da5",
      "nomAutoecole": "Auto-École Mojay",
      "phoneNumber": "787570707",
      "Admin_displayName": "Mamadou DIEYE",
      "studentsCount": 142,
      "created_at": "2024-01-05T14:30:00.000Z"
    },
    {
      "_id": "659816a89f5a6dc6bc104da6",
      "nomAutoecole": "Excellence Conduite",
      "phoneNumber": "788699262",
      "Admin_displayName": "Awa DIOP",
      "studentsCount": 87,
      "created_at": "2024-01-08T09:20:00.000Z"
    }
  ]
}
```

---

## 3. AUTOECOLES_CURRENT_USER - Élèves

### 3.1 Nombre total d'élèves

**GET** `/dashboard/students/count`

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/students/count" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "count": 456
}
```

---

### 3.2 Liste paginée des élèves avec recherche

**GET** `/dashboard/students/list`

**Paramètres**:
- `page` (query, optional): Numéro de page
- `limit` (query, optional): Nombre d'éléments par page
- `search` (query, optional): Recherche par nom, téléphone ou auto-école

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/students/list?page=1&limit=10&search=Fatou" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "students": [
    {
      "_id": "67850b8edccb5bc0fc311a49",
      "fullname": "Fatou FALL",
      "tel": "781234567",
      "name_autoecole": "Auto-École Mojay",
      "tel_autoecole": "787570707",
      "home_ec": "Dakar",
      "created_at": "2024-11-10T08:15:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 3.3 Élèves par auto-école

**GET** `/dashboard/students/by-autoecole/:id`

**Paramètres**:
- `id` (path, required): ID de l'auto-école
- `page` (query, optional): Numéro de page
- `limit` (query, optional): Nombre d'éléments par page

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/students/by-autoecole/659816a89f5a6dc6bc104da5?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "autoecole_id": "659816a89f5a6dc6bc104da5",
  "students": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 142
  }
}
```

---

### 3.4 Nouvelles inscriptions par date

**GET** `/dashboard/students/by-date`

Retourne le nombre de nouvelles inscriptions d'élèves par jour.

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/students/by-date" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "dailyStats": [
    {
      "date": "2025-11-10",
      "count": 15
    },
    {
      "date": "2025-11-11",
      "count": 22
    },
    {
      "date": "2025-11-12",
      "count": 18
    }
  ]
}
```

---

### 3.5 Élèves premium

**GET** `/dashboard/students/premium`

Retourne uniquement les élèves avec un abonnement premium (tel_autoecole = 787570707).

**Paramètres**:
- `page` (query, optional): Numéro de page
- `limit` (query, optional): Nombre d'éléments par page

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/students/premium?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "students": [
    {
      "_id": "67850b8edccb5bc0fc311a49",
      "fullname": "Fatou FALL",
      "tel": "781234567",
      "tel_autoecole": "787570707",
      "name_autoecole": "Auto-École Mojay Premium"
    }
  ],
  "count": 142,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 142
  }
}
```

---

### 3.6 Élèves actifs récemment

**GET** `/dashboard/students/active`

Retourne les élèves ayant eu des interactions récentes avec le chatbot.

**Paramètres**:
- `idbot` (query, optional): ID du chatbot (défaut: 659816a89f5a6dc6bc104da5)

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/students/active?idbot=659816a89f5a6dc6bc104da5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "activeUsers": [
    {
      "_id": "2025-11-19",
      "activeUsers": 45
    },
    {
      "_id": "2025-11-18",
      "activeUsers": 52
    }
  ]
}
```

---

## 4. AUTOECOLES_QUIZZ - Quiz

### 4.1 Nombre total de quiz

**GET** `/dashboard/quizz/count`

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/quizz/count" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "count": 25
}
```

---

### 4.2 Liste des quiz

**GET** `/dashboard/quizz/list`

Retourne la liste des quiz avec le nombre de questions.

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/quizz/list" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "quizz": [
    {
      "_id": "659816b89f5a6dc6bc104db0",
      "title": "Code de la Route - Signalisation",
      "number_quizz": 30
    },
    {
      "_id": "659816b89f5a6dc6bc104db1",
      "title": "Priorités et Intersections",
      "number_quizz": 25
    }
  ],
  "count": 25
}
```

---

### 4.3 Détails d'un quiz

**GET** `/dashboard/quizz/:id/details`

**Paramètres**:
- `id` (path, required): ID du quiz

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/quizz/659816b89f5a6dc6bc104db0/details" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "quizz": {
    "_id": "659816b89f5a6dc6bc104db0",
    "title": "Code de la Route - Signalisation",
    "list_quizz": [
      {
        "text": "Que signifie ce panneau ?",
        "image": "https://example.com/panneau1.jpg",
        "buttons": [
          { "id": "a", "title": "Stop obligatoire" },
          { "id": "b", "title": "Cédez le passage" },
          { "id": "c", "title": "Sens interdit" }
        ],
        "answer": { "text": "b" }
      }
    ],
    "created_at": "2024-01-05T15:00:00.000Z"
  },
  "questionsCount": 30
}
```

---

### 4.4 Statistiques des quiz

**GET** `/dashboard/quizz/stats`

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/quizz/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "stats": {
    "totalQuizz": 25,
    "totalQuestions": 687,
    "avgQuestionsPerQuizz": 27.48,
    "minQuestions": 10,
    "maxQuestions": 50
  }
}
```

---

### 4.5 Quiz les plus populaires

**GET** `/dashboard/quizz/popular`

Retourne les quiz les plus utilisés basés sur le nombre de tests effectués.

**Paramètres**:
- `limit` (query, optional): Nombre de quiz à retourner (défaut: 10)

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/quizz/popular?limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "popularQuizz": [
    {
      "_id": "659816b89f5a6dc6bc104db0",
      "title": "Code de la Route - Signalisation",
      "testCount": 245,
      "avgScore": 23.5
    },
    {
      "_id": "659816b89f5a6dc6bc104db1",
      "title": "Priorités et Intersections",
      "testCount": 198,
      "avgScore": 19.8
    }
  ]
}
```

---

## 5. AUTOECOLES_QUIZZ_TEST - Résultats Tests

### 5.1 Nombre total de tests

**GET** `/dashboard/tests/count`

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/tests/count" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "count": 3542
}
```

---

### 5.2 Tests par élève

**GET** `/dashboard/tests/by-student/:tel`

**Paramètres**:
- `tel` (path, required): Numéro de téléphone de l'élève

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/tests/by-student/781234567" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "student_tel": "781234567",
  "tests": [
    {
      "_id": "67850c8edccb5bc0fc311a50",
      "tel": "781234567",
      "id_quizz": "659816b89f5a6dc6bc104db0",
      "score": 25,
      "answers": [...],
      "created_at": "2025-11-19T10:30:00.000Z"
    }
  ],
  "count": 12
}
```

---

### 5.3 Tests par quiz

**GET** `/dashboard/tests/by-quiz/:id`

**Paramètres**:
- `id` (path, required): ID du quiz

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/tests/by-quiz/659816b89f5a6dc6bc104db0" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "quizz_id": "659816b89f5a6dc6bc104db0",
  "tests": [...],
  "count": 245
}
```

---

### 5.4 Statistiques globales des tests

**GET** `/dashboard/tests/stats`

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/tests/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "stats": {
    "totalTests": 3542,
    "avgScore": 21.45,
    "maxScore": 30,
    "minScore": 5,
    "totalAnswers": 97176
  }
}
```

---

### 5.5 Tests récents

**GET** `/dashboard/tests/recent`

**Paramètres**:
- `limit` (query, optional): Nombre de tests à retourner (défaut: 20)

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/tests/recent?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "recentTests": [
    {
      "_id": "67850c8edccb5bc0fc311a50",
      "tel": "781234567",
      "score": 25,
      "created_at": "2025-11-19T10:30:00.000Z",
      "answers": 30,
      "student_name": "Fatou FALL",
      "autoecole": "Auto-École Mojay"
    }
  ]
}
```

---

### 5.6 Classement (Leaderboard)

**GET** `/dashboard/tests/leaderboard`

**Paramètres**:
- `limit` (query, optional): Nombre d'élèves à retourner (défaut: 10)

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/tests/leaderboard?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
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
    },
    {
      "tel": "778765432",
      "student_name": "Moussa SARR",
      "autoecole": "Excellence Conduite",
      "bestScore": 29,
      "totalTests": 12,
      "avgScore": 26.8
    }
  ]
}
```

---

## 6. AUTOECOLES_COURSES - Cours

### 6.1 Nombre total de cours

**GET** `/dashboard/courses/count`

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/courses/count" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "count": 18
}
```

---

### 6.2 Liste des cours

**GET** `/dashboard/courses/list`

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/courses/list" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "courses": [
    {
      "_id": "659816c89f5a6dc6bc104dc0",
      "title": "La Signalisation Routière",
      "number_chapter": 8
    },
    {
      "_id": "659816c89f5a6dc6bc104dc1",
      "title": "Les Priorités",
      "number_chapter": 5
    }
  ],
  "count": 18
}
```

---

### 6.3 Détails d'un cours

**GET** `/dashboard/courses/:id/details`

**Paramètres**:
- `id` (path, required): ID du cours

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/courses/659816c89f5a6dc6bc104dc0/details" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "course": {
    "_id": "659816c89f5a6dc6bc104dc0",
    "title": "La Signalisation Routière",
    "Sections": [
      {
        "title": "Panneaux de danger",
        "content": "Les panneaux de danger avertissent...",
        "images": ["url1.jpg", "url2.jpg"]
      },
      {
        "title": "Panneaux d'interdiction",
        "content": "Les panneaux d'interdiction...",
        "images": ["url3.jpg"]
      }
    ],
    "created_at": "2024-01-06T09:00:00.000Z"
  },
  "sectionsCount": 8
}
```

---

### 6.4 Statistiques des cours

**GET** `/dashboard/courses/stats`

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/courses/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "stats": {
    "totalCourses": 18,
    "totalSections": 96,
    "avgSectionsPerCourse": 5.33,
    "minSections": 3,
    "maxSections": 10
  }
}
```

---

### 6.5 Modifier un cours

**PUT** `/dashboard/courses/:id`

Met à jour les informations d'un cours (titre, description, etc.).

**Paramètres**:
- `id` (path, required): ID du cours

**Body (JSON)**:
```json
{
  "titre": "Nouveau titre du cours",
  "description": "Nouvelle description",
  "duree": "3h30",
  "niveau": "débutant"
}
```

**Exemple de requête**:
```bash
curl -X PUT "https://autoecole.mojay.pro/dashboard/courses/662686c375bf8788b07b7140" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Code de la route - Édition 2025",
    "description": "Cours mis à jour avec les dernières réglementations"
  }'
```

**Réponse**:
```json
{
  "success": true,
  "message": "Course updated successfully",
  "course": {
    "_id": "662686c375bf8788b07b7140",
    "titre": "Code de la route - Édition 2025",
    "description": "Cours mis à jour avec les dernières réglementations",
    "Sections": [...]
  }
}
```

---

### 6.6 Ajouter un chapitre à un cours

**POST** `/dashboard/courses/:id/chapters`

Ajoute un nouveau chapitre (section) à un cours existant.

**Paramètres**:
- `id` (path, required): ID du cours

**Body (JSON)**:
```json
{
  "titre": "Nouveau chapitre",
  "description": "Description du chapitre",
  "contenu": "Contenu du chapitre",
  "ordre": 5
}
```

**Exemple de requête**:
```bash
curl -X POST "https://autoecole.mojay.pro/dashboard/courses/662686c375bf8788b07b7140/chapters" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Les panneaux de signalisation",
    "description": "Comprendre les différents panneaux",
    "contenu": "Contenu détaillé...",
    "ordre": 3
  }'
```

**Réponse**:
```json
{
  "success": true,
  "message": "Chapter added successfully",
  "chapter": {
    "_id": "674a1b2c3d4e5f6g7h8i9j0k",
    "titre": "Les panneaux de signalisation",
    "description": "Comprendre les différents panneaux",
    "contenu": "Contenu détaillé...",
    "ordre": 3,
    "createdAt": "2025-11-20T10:30:00.000Z"
  },
  "course": {
    "_id": "662686c375bf8788b07b7140",
    "titre": "Code de la route",
    "Sections": [...]
  }
}
```

---

### 6.7 Modifier un chapitre

**PUT** `/dashboard/courses/:id/chapters/:chapterId`

Modifie les informations d'un chapitre spécifique dans un cours.

**Paramètres**:
- `id` (path, required): ID du cours
- `chapterId` (path, required): ID du chapitre

**Body (JSON)**:
```json
{
  "titre": "Titre modifié",
  "description": "Description modifiée",
  "contenu": "Nouveau contenu"
}
```

**Exemple de requête**:
```bash
curl -X PUT "https://autoecole.mojay.pro/dashboard/courses/662686c375bf8788b07b7140/chapters/674a1b2c3d4e5f6g7h8i9j0k" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Les panneaux de signalisation - Version 2",
    "description": "Description mise à jour"
  }'
```

**Réponse**:
```json
{
  "success": true,
  "message": "Chapter updated successfully",
  "chapter": {
    "_id": "674a1b2c3d4e5f6g7h8i9j0k",
    "titre": "Les panneaux de signalisation - Version 2",
    "description": "Description mise à jour",
    "updatedAt": "2025-11-20T11:00:00.000Z"
  },
  "course": {
    "_id": "662686c375bf8788b07b7140",
    "Sections": [...]
  }
}
```

---

### 6.8 Supprimer un chapitre

**DELETE** `/dashboard/courses/:id/chapters/:chapterId`

Supprime un chapitre d'un cours.

**Paramètres**:
- `id` (path, required): ID du cours
- `chapterId` (path, required): ID du chapitre à supprimer

**Exemple de requête**:
```bash
curl -X DELETE "https://autoecole.mojay.pro/dashboard/courses/662686c375bf8788b07b7140/chapters/674a1b2c3d4e5f6g7h8i9j0k" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "message": "Chapter deleted successfully",
  "deletedChapterId": "674a1b2c3d4e5f6g7h8i9j0k",
  "course": {
    "_id": "662686c375bf8788b07b7140",
    "titre": "Code de la route",
    "Sections": [...]
  }
}
```

---

## 7. KPIs et Statistiques

### 7.1 Vue d'ensemble globale

**GET** `/dashboard/kpis/global`

Retourne tous les KPIs principaux en une seule requête.

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/kpis/global" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
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

---

### 7.2 Taux d'engagement

**GET** `/dashboard/kpis/engagement`

**Paramètres**:
- `idbot` (query, optional): ID du chatbot
- `page` (query, optional): Numéro de page
- `limit` (query, optional): Nombre d'éléments par page

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/kpis/engagement?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "engagement": [
    {
      "user_phone_number": "781234567",
      "totalMessages": 145,
      "activeDays": [
        { "date": "2025-11-10", "messageCount": 15 },
        { "date": "2025-11-11", "messageCount": 22 }
      ],
      "fullname": "Fatou FALL",
      "name_autoecole": "Auto-École Mojay"
    }
  ]
}
```

---

### 7.3 Performance globale

**GET** `/dashboard/kpis/performance`

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/kpis/performance" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "performance": {
    "avgSuccessRate": 71.5,
    "totalTests": 3542,
    "totalQuestions": 97176
  }
}
```

---

### 7.4 Croissance

**GET** `/dashboard/kpis/growth`

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/kpis/growth" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse**:
```json
{
  "success": true,
  "growthData": [
    { "date": "2025-11-10", "count": 15 },
    { "date": "2025-11-11", "count": 22 },
    { "date": "2025-11-12", "count": 18 }
  ]
}
```

---

## 🏥 Health Check

### Test de santé de l'API

**GET** `/dashboard/health`

**Authentification**: Non requise

**Exemple de requête**:
```bash
curl -X GET "https://autoecole.mojay.pro/dashboard/health"
```

**Réponse**:
```json
{
  "success": true,
  "message": "PeeloCar Dashboard API is running",
  "timestamp": "2025-11-19T13:45:30.123Z"
}
```

---

## 📊 Résumé des Routes

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/dashboard/health` | Health check (sans auth) |
| GET | `/dashboard/users/count` | Nombre d'admins |
| GET | `/dashboard/users/list` | Liste des admins |
| GET | `/dashboard/autoecoles/count` | Nombre d'auto-écoles |
| GET | `/dashboard/autoecoles/list` | Liste des auto-écoles |
| GET | `/dashboard/autoecoles/:id/students` | Élèves par auto-école |
| GET | `/dashboard/autoecoles/stats` | Stats des auto-écoles |
| GET | `/dashboard/students/count` | Nombre d'élèves |
| GET | `/dashboard/students/list` | Liste des élèves |
| GET | `/dashboard/students/by-autoecole/:id` | Élèves par auto-école |
| GET | `/dashboard/students/by-date` | Inscriptions par date |
| GET | `/dashboard/students/premium` | Élèves premium |
| GET | `/dashboard/students/active` | Élèves actifs |
| GET | `/dashboard/quizz/count` | Nombre de quiz |
| GET | `/dashboard/quizz/list` | Liste des quiz |
| GET | `/dashboard/quizz/:id/details` | Détails d'un quiz |
| GET | `/dashboard/quizz/stats` | Stats des quiz |
| GET | `/dashboard/quizz/popular` | Quiz populaires |
| GET | `/dashboard/tests/count` | Nombre de tests |
| GET | `/dashboard/tests/by-student/:tel` | Tests par élève |
| GET | `/dashboard/tests/by-quiz/:id` | Tests par quiz |
| GET | `/dashboard/tests/stats` | Stats des tests |
| GET | `/dashboard/tests/recent` | Tests récents |
| GET | `/dashboard/tests/leaderboard` | Classement |
| GET | `/dashboard/courses/count` | Nombre de cours |
| GET | `/dashboard/courses/list` | Liste des cours |
| GET | `/dashboard/courses/:id/details` | Détails d'un cours |
| GET | `/dashboard/courses/stats` | Stats des cours |
| GET | `/dashboard/kpis/global` | KPIs globaux |
| GET | `/dashboard/kpis/engagement` | Engagement élèves |
| GET | `/dashboard/kpis/performance` | Performance quiz |
| GET | `/dashboard/kpis/growth` | Croissance |

**Total: 34 endpoints**

---

## 🔧 Installation et Démarrage

```bash
# Démarrer l'API
cd /home/ec2-user/PeeloCalendar
node peelocarDashboard.js

# L'API sera disponible sur http://localhost:7569
```

 