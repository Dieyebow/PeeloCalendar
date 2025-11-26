# 📚 Gestion CRUD des Cours - API Dashboard PeeloCar

**Date**: 2025-11-20
**Version**: 1.1.0

---

## 🎯 Nouvelles Fonctionnalités

4 nouvelles routes CRUD ont été ajoutées pour la gestion complète des cours et de leurs chapitres.

### Routes Implémentées

| Méthode | Route | Description |
|---------|-------|-------------|
| **PUT** | `/dashboard/courses/:id` | Modifier un cours |
| **POST** | `/dashboard/courses/:id/chapters` | Ajouter un chapitre |
| **PUT** | `/dashboard/courses/:id/chapters/:chapterId` | Modifier un chapitre |
| **DELETE** | `/dashboard/courses/:id/chapters/:chapterId` | Supprimer un chapitre |

---

## 📝 Documentation Détaillée

### 1. Modifier un Cours

**PUT** `/dashboard/courses/:id`

Met à jour les propriétés d'un cours (titre, description, etc.).

#### Exemple cURL:
```bash
curl -X PUT "https://autoecole.mojay.pro/dashboard/courses/662686c375bf8788b07b7140" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Code de la route - Édition 2025",
    "description": "Cours mis à jour avec les dernières réglementations",
    "duree": "4h",
    "niveau": "débutant"
  }'
```

#### Réponse:
```json
{
  "success": true,
  "message": "Course updated successfully",
  "course": {
    "_id": "662686c375bf8788b07b7140",
    "titre": "Code de la route - Édition 2025",
    "description": "Cours mis à jour...",
    "Sections": [...]
  }
}
```

---

### 2. Ajouter un Chapitre

**POST** `/dashboard/courses/:id/chapters`

Ajoute un nouveau chapitre (section) à un cours.

#### Exemple cURL:
```bash
curl -X POST "https://autoecole.mojay.pro/dashboard/courses/662686c375bf8788b07b7140/chapters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Les panneaux de signalisation",
    "description": "Comprendre les différents panneaux",
    "contenu": "Les panneaux de signalisation sont divisés en 4 catégories...",
    "ordre": 3,
    "duree": "30min"
  }'
```

#### Réponse:
```json
{
  "success": true,
  "message": "Chapter added successfully",
  "chapter": {
    "_id": "674a1b2c3d4e5f6g7h8i9j0k",
    "titre": "Les panneaux de signalisation",
    "description": "Comprendre les différents panneaux",
    "contenu": "Les panneaux de signalisation...",
    "ordre": 3,
    "createdAt": "2025-11-20T10:30:00.000Z"
  },
  "course": {
    "_id": "662686c375bf8788b07b7140",
    "Sections": [...]
  }
}
```

---

### 3. Modifier un Chapitre

**PUT** `/dashboard/courses/:id/chapters/:chapterId`

Met à jour les propriétés d'un chapitre existant.

#### Exemple cURL:
```bash
curl -X PUT "https://autoecole.mojay.pro/dashboard/courses/662686c375bf8788b07b7140/chapters/674a1b2c3d4e5f6g7h8i9j0k" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Les panneaux de signalisation - Version 2",
    "description": "Description mise à jour avec exemples visuels",
    "contenu": "Contenu enrichi avec images et quiz"
  }'
```

#### Réponse:
```json
{
  "success": true,
  "message": "Chapter updated successfully",
  "chapter": {
    "_id": "674a1b2c3d4e5f6g7h8i9j0k",
    "titre": "Les panneaux de signalisation - Version 2",
    "description": "Description mise à jour...",
    "updatedAt": "2025-11-20T11:00:00.000Z"
  },
  "course": {
    "_id": "662686c375bf8788b07b7140",
    "Sections": [...]
  }
}
```

---

### 4. Supprimer un Chapitre

**DELETE** `/dashboard/courses/:id/chapters/:chapterId`

Supprime un chapitre d'un cours.

#### Exemple cURL:
```bash
curl -X DELETE "https://autoecole.mojay.pro/dashboard/courses/662686c375bf8788b07b7140/chapters/674a1b2c3d4e5f6g7h8i9j0k" \
  -H "Authorization: Bearer $TOKEN"
```

#### Réponse:
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

## 🧪 Tests

### Script de Test Automatisé

Un script bash complet a été créé pour tester toutes les opérations CRUD:

```bash
cd /home/ec2-user/PeeloCalendar
./test_courses_crud.sh
```

### Ce que teste le script:

1. ✅ Récupérer les détails d'un cours
2. ✅ Ajouter un nouveau chapitre
3. ✅ Modifier le chapitre créé
4. ✅ Modifier le cours entier
5. ✅ Supprimer le chapitre créé
6. ✅ Vérifier que la suppression a fonctionné

---

## 📊 Statut des Codes HTTP

| Code | Signification | Cas d'utilisation |
|------|---------------|-------------------|
| **200** | OK | Modification ou suppression réussie |
| **201** | Created | Création de chapitre réussie |
| **400** | Bad Request | Données invalides |
| **401** | Unauthorized | Token manquant |
| **403** | Forbidden | Token expiré |
| **404** | Not Found | Cours ou chapitre non trouvé |
| **500** | Server Error | Erreur serveur |

---

## 🔒 Sécurité

- ✅ Authentification JWT obligatoire sur toutes les routes
- ✅ Validation de l'existence du cours avant modification
- ✅ Validation de l'existence du chapitre avant modification/suppression
- ✅ Gestion des erreurs complète
- ✅ Logs détaillés pour le debugging

---

## 💾 Structure des Données

### Cours (autoecoles_courses)
```json
{
  "_id": "662686c375bf8788b07b7140",
  "titre": "Code de la route",
  "description": "Cours complet sur le code de la route",
  "duree": "3h30",
  "niveau": "débutant",
  "Sections": [
    {
      "_id": "674a1b2c3d4e5f6g7h8i9j0k",
      "titre": "Les panneaux de signalisation",
      "description": "...",
      "contenu": "...",
      "ordre": 1,
      "createdAt": "2025-11-20T10:30:00.000Z",
      "updatedAt": "2025-11-20T11:00:00.000Z"
    }
  ]
}
```

---

## 🔧 Utilisation dans le Frontend

### Exemple React avec Fetch:

```javascript
// Modifier un cours
async function updateCourse(courseId, courseData) {
  const response = await fetch(
    `https://autoecole.mojay.pro/dashboard/courses/${courseId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(courseData)
    }
  );
  return response.json();
}

// Ajouter un chapitre
async function addChapter(courseId, chapterData) {
  const response = await fetch(
    `https://autoecole.mojay.pro/dashboard/courses/${courseId}/chapters`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chapterData)
    }
  );
  return response.json();
}

// Modifier un chapitre
async function updateChapter(courseId, chapterId, chapterData) {
  const response = await fetch(
    `https://autoecole.mojay.pro/dashboard/courses/${courseId}/chapters/${chapterId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chapterData)
    }
  );
  return response.json();
}

// Supprimer un chapitre
async function deleteChapter(courseId, chapterId) {
  const response = await fetch(
    `https://autoecole.mojay.pro/dashboard/courses/${courseId}/chapters/${chapterId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.json();
}
```

---

## 📌 Notes Importantes

### Avant de modifier un cours:
1. Toujours récupérer les détails du cours avec `GET /dashboard/courses/:id/details`
2. Vérifier que le cours existe (status 200)
3. Conserver l'`_id` dans vos requêtes

### Gestion des chapitres:
- Chaque chapitre a un `_id` unique généré automatiquement
- Les chapitres sont stockés dans le champ `Sections` du cours
- Lors de la modification, tous les champs non fournis sont conservés
- Lors de la suppression, le chapitre est retiré du tableau `Sections`

### Bonnes pratiques:
- Toujours tester avec un cours de test en premier
- Sauvegarder les données importantes avant modification
- Utiliser le script de test pour valider les modifications
- Vérifier les logs PM2 en cas d'erreur: `pm2 logs autoecole`

---

## 🐛 Dépannage

### Erreur 404 "Course not found"
- Vérifier que l'ID du cours est correct
- S'assurer que le cours existe dans la collection `autoecoles_courses`

### Erreur 404 "Chapter not found"
- Vérifier que l'ID du chapitre est correct
- S'assurer que le chapitre existe dans le tableau `Sections` du cours

### Erreur 403 Forbidden
- Token JWT expiré → Générer un nouveau token
- Vérifier le format du header: `Authorization: Bearer TOKEN`

### Erreur 500
- Consulter les logs PM2: `pm2 logs autoecole`
- Vérifier la connexion MongoDB
- Vérifier la structure des données envoyées

---

## 📂 Fichiers Mis à Jour

- ✅ [peelocarDashboard.js](./peelocarDashboard.js) - 4 nouvelles routes (lignes 772-1011)
- ✅ [DASHBOARD_API.md](./DASHBOARD_API.md) - Documentation complète mise à jour
- ✅ [test_courses_crud.sh](./test_courses_crud.sh) - Script de test automatisé
- ✅ [COURSES_CRUD_README.md](./COURSES_CRUD_README.md) - Ce fichier

---

## 🚀 Total des Endpoints

**Avant cette mise à jour**: 34 endpoints
**Après cette mise à jour**: 38 endpoints

### Répartition:
- Utilisateurs: 2 endpoints
- Auto-écoles: 4 endpoints
- Élèves: 6 endpoints
- Quiz: 5 endpoints
- Tests: 6 endpoints
- **Cours: 8 endpoints** (4 GET + 4 CRUD nouvelles)
- KPIs: 4 endpoints
- Health: 1 endpoint

---

## ✅ Checklist d'Intégration

- [ ] Lire la documentation complète
- [ ] Configurer le TOKEN JWT
- [ ] Identifier un cours de test dans la base
- [ ] Tester avec le script `test_courses_crud.sh`
- [ ] Implémenter les appels API dans le frontend
- [ ] Gérer les cas d'erreur (403, 404, 500)
- [ ] Ajouter une confirmation avant suppression
- [ ] Implémenter l'optimistic update (optionnel)
- [ ] Tester en environnement de production

---

## 🎉 Résumé

Les 4 nouvelles routes CRUD pour la gestion des cours sont maintenant **opérationnelles et documentées**.

- ✅ Implémentation terminée
- ✅ API redémarrée (PM2)
- ✅ Documentation mise à jour
- ✅ Script de test créé
- ✅ Prêt pour utilisation en production

Pour démarrer, exécutez:
```bash
cd /home/ec2-user/PeeloCalendar
./test_courses_crud.sh
```

---

**Développé avec ❤️ pour PeeloCar**
**Version**: 1.1.0
**Date**: 2025-11-20
