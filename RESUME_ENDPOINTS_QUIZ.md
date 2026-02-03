# Résumé des Endpoints Quiz - API Dashboard

## 📋 Vue d'ensemble

Vous disposez maintenant de **15 endpoints** pour une gestion complète des quiz via l'API Dashboard.

Base URL : `https://autoecole.mojay.pro/dashboard`

---

## 🔍 Endpoints de Lecture (GET) - 5 endpoints

| Endpoint | Description | Retour |
|----------|-------------|--------|
| `GET /quizz/count` | Nombre total de quiz | Count |
| `GET /quizz/list` | Liste des quiz (léger) | Array + count questions |
| `GET /quizz/:id/details` | Détails complets d'un quiz | Quiz complet avec toutes les questions |
| `GET /quizz/stats` | Statistiques globales | Total, moyennes, min/max |
| `GET /quizz/popular?limit=N` | Quiz les plus utilisés | Array trié par popularité |

---

## ✏️ Endpoints de Création (POST) - 6 endpoints

### Gestion basique
| Endpoint | Description | Body Type |
|----------|-------------|-----------|
| `POST /quizz` | Créer un nouveau quiz | JSON |
| `POST /quizz/:id/questions` | Ajouter une question | JSON |

### Upload de fichiers
| Endpoint | Description | Body Type |
|----------|-------------|-----------|
| `POST /quizz/:id/questions/:index/upload-image` | Upload image question | multipart/form-data |
| `POST /quizz/:id/questions/:index/upload-audio` | Upload audio question | multipart/form-data |
| `POST /quizz/:id/questions/:index/upload-answer-audio` | Upload audio réponse | multipart/form-data |
| `POST /quizz/:id/questions/upload-full` | Ajouter question + tous fichiers | multipart/form-data |

---

## 🔄 Endpoints de Modification (PUT) - 2 endpoints

| Endpoint | Description | Body Type |
|----------|-------------|-----------|
| `PUT /quizz/:id` | Modifier le titre du quiz | JSON |
| `PUT /quizz/:id/questions/:index` | Modifier une question | JSON |

---

## 🗑️ Endpoints de Suppression (DELETE) - 2 endpoints

| Endpoint | Description |
|----------|-------------|
| `DELETE /quizz/:id/questions/:index` | Supprimer une question |
| `DELETE /quizz/:id` | Supprimer un quiz complet |

---

## 🎯 Workflows Recommandés

### 1. Créer un quiz complet avec fichiers

```bash
# Étape 1 : Créer le quiz
curl -X POST https://autoecole.mojay.pro/dashboard/quizz \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Code de la Route 2025"}'
# Récupère QUIZ_ID

# Étape 2 : Ajouter question avec fichiers
curl -X POST https://autoecole.mojay.pro/dashboard/quizz/QUIZ_ID/questions/upload-full \
  -H "Authorization: Bearer TOKEN" \
  -F "text=Quelle est la vitesse en ville?" \
  -F 'buttons=[{"id":"1","title":"30"},{"id":"2","title":"50"}]' \
  -F "textAnswer=50 km/h" \
  -F "image=@image.jpg" \
  -F "audio=@question.mp3" \
  -F "audioanswer=@answer.mp3"
```

### 2. Modifier une question existante avec nouveau fichier

```bash
# Étape 1 : Upload nouvelle image
curl -X POST https://autoecole.mojay.pro/dashboard/quizz/QUIZ_ID/questions/0/upload-image \
  -H "Authorization: Bearer TOKEN" \
  -F "image=@new-image.jpg"

# Étape 2 : Modifier le texte si nécessaire
curl -X PUT https://autoecole.mojay.pro/dashboard/quizz/QUIZ_ID/questions/0 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text":"Question modifiée",
    "buttons":[{"id":"1","title":"Oui"},{"id":"2","title":"Non"}],
    "answer":{"text":"Oui"}
  }'
```

### 3. Créer un quiz simple (sans fichiers)

```bash
# Étape 1 : Créer le quiz
curl -X POST https://autoecole.mojay.pro/dashboard/quizz \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Quiz Rapide"}'

# Étape 2 : Ajouter questions (sans fichiers)
curl -X POST https://autoecole.mojay.pro/dashboard/quizz/QUIZ_ID/questions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text":"Question simple?",
    "buttons":[{"id":"1","title":"Oui"},{"id":"2","title":"Non"}],
    "answer":{"text":"Oui"}
  }'
```

---

## 📊 Statistiques et Monitoring

```bash
# Nombre total de quiz
curl https://autoecole.mojay.pro/dashboard/quizz/count \
  -H "Authorization: Bearer TOKEN"

# Statistiques détaillées
curl https://autoecole.mojay.pro/dashboard/quizz/stats \
  -H "Authorization: Bearer TOKEN"

# Top 5 quiz populaires
curl "https://autoecole.mojay.pro/dashboard/quizz/popular?limit=5" \
  -H "Authorization: Bearer TOKEN"
```

---

## 🎨 Structure d'une Question Complète

```json
{
  "image": "https://autoecole.mojay.pro/public/assets/uploads/images/AbC1_1732739234567.jpg",
  "text": "Quelle est la vitesse maximale en ville?",
  "audio": "https://autoecole.mojay.pro/public/assets/uploads/audios/XyZ2_1732739234567.mp3",
  "buttons": [
    {"id": "1", "title": "30 km/h"},
    {"id": "2", "title": "50 km/h"},
    {"id": "3", "title": "70 km/h"}
  ],
  "answer": {
    "audio": "https://autoecole.mojay.pro/public/assets/uploads/audios/DeF3_1732739234567.mp3",
    "text": "50 km/h"
  }
}
```

---

## ⚙️ Configuration Requise

### Headers Obligatoires
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Content-Type selon l'endpoint
- **JSON** : `Content-Type: application/json`
- **Upload** : Automatique avec `-F` (multipart/form-data)

### Formats de Fichiers Supportés
- **Images** : JPG, JPEG, PNG, GIF, WebP
- **Audio** : MP3, WAV, M4A, OGG

---

## 🔐 Sécurité

- ✅ Tous les endpoints nécessitent une authentification JWT
- ✅ Les fichiers uploadés sont renommés avec un identifiant unique
- ✅ Les fichiers sont stockés dans des dossiers séparés (images/audios)
- ✅ Validation des paramètres côté serveur
- ⚠️ Authentification actuellement en mode développement (bypass activé)

---

## 📁 Emplacements des Fichiers

```
public/assets/uploads/
├── images/          # Images des questions
│   └── AbC1_1732739234567.jpg
├── audios/          # Audios des questions et réponses
│   ├── XyZ2_1732739234567.mp3
│   └── DeF3_1732739234567.mp3
└── courses/         # Images des cours (autre endpoint)
    └── GhI4_1732739234567.jpg
```

Accès public : `https://autoecole.mojay.pro/public/assets/uploads/[type]/[filename]`

---

## 🧪 Tests

Script de test complet disponible : `/home/ec2-user/test_quiz_crud.sh`

Pour l'exécuter :
```bash
/home/ec2-user/test_quiz_crud.sh
```

---

## 📚 Documentation Complète

Fichier détaillé : `/home/ec2-user/PeeloCalendar/ENDPOINTS_QUIZ_API.md`

Contient :
- Description détaillée de chaque endpoint
- Exemples de requêtes/réponses
- Codes d'erreur
- Structure des données
- Exemples curl complets

---

## 🎯 Points Clés à Retenir

1. **Création en 2 étapes** : Créer quiz → Ajouter questions
2. **Upload séparé** : Vous pouvez ajouter des questions puis uploader les fichiers après
3. **Upload groupé** : Ou utiliser `/upload-full` pour tout faire en une fois
4. **Index commence à 0** : La première question est à l'index 0
5. **Modification partielle** : Vous pouvez modifier uniquement l'image sans toucher au texte
6. **Suppression granulaire** : Supprimer une question ou le quiz entier

---

## 🆘 Support

En cas de problème :
1. Vérifier les logs PM2 : `pm2 logs autoecole`
2. Tester avec curl pour isoler le problème
3. Vérifier que le token JWT est valide
4. Vérifier que les chemins de fichiers sont corrects

---

**Dernière mise à jour** : 2025-11-27
**Version API** : 1.0
**Status** : ✅ Production Ready
