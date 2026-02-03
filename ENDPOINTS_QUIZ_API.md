# API Documentation - Gestion des Quiz (autoecoles_quizz)

## Base URL
```
https://autoecole.mojay.pro
```

Tous les endpoints nécessitent un header d'authentification :
```
Authorization: Bearer <token>
```

---

## Endpoints de Lecture (GET)

### 1. Compter les quiz
**GET** `/dashboard/quizz/count`

Retourne le nombre total de quiz dans la base de données.

**Réponse :**
```json
{
  "success": true,
  "count": 4
}
```

---

### 2. Lister les quiz (version légère)
**GET** `/dashboard/quizz/list`

Retourne la liste de tous les quiz avec le nombre de questions par quiz.

**Réponse :**
```json
{
  "success": true,
  "quizz": [
    {
      "_id": "667ae5aa6cf4978137fb0b19",
      "title": "Signalisation Horizontale",
      "number_quizz": 5
    },
    {
      "_id": "660438a43406fc5b369fe12b",
      "title": "Panneaux Triangles",
      "number_quizz": 7
    }
  ],
  "count": 2
}
```

---

### 3. Détails complets d'un quiz
**GET** `/dashboard/quizz/:id/details`

Retourne toutes les informations d'un quiz spécifique, incluant toutes les questions.

**Paramètres :**
- `id` (string) : MongoDB ObjectId du quiz

**Réponse :**
```json
{
  "success": true,
  "quizz": {
    "_id": "667ae5aa6cf4978137fb0b19",
    "title": "Signalisation Horizontale",
    "id_user": "65a03b6e2f704c698db2bba6",
    "list_quizz": [
      {
        "image": "https://example.com/image.jpg",
        "text": "Quelle est la vitesse maximale en ville?",
        "audio": "",
        "buttons": [
          {"id": "1", "title": "30 km/h"},
          {"id": "2", "title": "50 km/h"},
          {"id": "3", "title": "70 km/h"}
        ],
        "answer": {
          "audio": "",
          "text": "50 km/h"
        }
      }
    ],
    "created_at": "2025-11-27T20:00:20.168Z",
    "update_date": "2025-11-27T20:00:20.271Z"
  },
  "questionsCount": 1
}
```

---

### 4. Statistiques des quiz
**GET** `/dashboard/quizz/stats`

Retourne des statistiques globales sur les quiz (nombre total, nombre de questions, moyennes, etc.).

**Réponse :**
```json
{
  "success": true,
  "stats": {
    "totalQuizz": 4,
    "totalQuestions": 22,
    "avgQuestionsPerQuizz": 5.5,
    "minQuestions": 1,
    "maxQuestions": 9
  }
}
```

---

### 5. Quiz les plus populaires
**GET** `/dashboard/quizz/popular?limit=10`

Retourne les quiz les plus utilisés basé sur les tests effectués.

**Query Parameters :**
- `limit` (number, optional) : Nombre de quiz à retourner (défaut: 10)

**Réponse :**
```json
{
  "success": true,
  "popularQuizz": [
    {
      "_id": "667ae5aa6cf4978137fb0b19",
      "testCount": 1523,
      "avgScore": 75.32,
      "title": "Signalisation Horizontale"
    }
  ]
}
```

---

## Endpoints de Création (POST)

### 6. Créer un nouveau quiz
**POST** `/dashboard/quizz`

Crée un nouveau quiz vide (sans questions).

**Body (JSON) :**
```json
{
  "title": "Mon Nouveau Quiz",
  "id_user": "65a03b6e2f704c698db2bba6"
}
```

**Champs requis :**
- `title` (string) : Titre du quiz

**Champs optionnels :**
- `id_user` (string) : ID de l'utilisateur créateur (utilise req.user._id si non fourni)

**Réponse :**
```json
{
  "success": true,
  "message": "Quiz created successfully",
  "quizz_id": "6928add4f399385b17b20aa0"
}
```

---

### 7. Ajouter une question à un quiz
**POST** `/dashboard/quizz/:id/questions`

Ajoute une nouvelle question à la fin de la liste des questions d'un quiz.

**Paramètres :**
- `id` (string) : MongoDB ObjectId du quiz

**Body (JSON) :**
```json
{
  "text": "Quelle est la vitesse maximale en ville?",
  "image": "https://example.com/image.jpg",
  "audio": "https://example.com/audio.mp3",
  "buttons": [
    {"id": "1", "title": "30 km/h"},
    {"id": "2", "title": "50 km/h"},
    {"id": "3", "title": "70 km/h"}
  ],
  "answer": {
    "text": "50 km/h",
    "audio": "https://example.com/answer-audio.mp3"
  }
}
```

**Champs requis :**
- `text` (string) : Texte de la question
- `buttons` (array) : Liste des boutons de réponse
  - Chaque bouton doit avoir : `id` et `title`
- `answer` (object) : Réponse correcte
  - Doit avoir au minimum : `text`

**Champs optionnels :**
- `image` (string) : URL de l'image de la question
- `audio` (string) : URL de l'audio de la question
- `answer.audio` (string) : URL de l'audio de la réponse

**Réponse :**
```json
{
  "success": true,
  "message": "Question added successfully"
}
```

---

## Endpoints de Modification (PUT)

### 8. Modifier le titre d'un quiz
**PUT** `/dashboard/quizz/:id`

Modifie les métadonnées d'un quiz (actuellement : uniquement le titre).

**Paramètres :**
- `id` (string) : MongoDB ObjectId du quiz

**Body (JSON) :**
```json
{
  "title": "Nouveau Titre du Quiz"
}
```

**Champs requis :**
- `title` (string) : Nouveau titre du quiz

**Réponse :**
```json
{
  "success": true,
  "message": "Quiz updated successfully"
}
```

---

### 9. Modifier une question spécifique
**PUT** `/dashboard/quizz/:id/questions/:index`

Modifie une question existante dans un quiz.

**Paramètres :**
- `id` (string) : MongoDB ObjectId du quiz
- `index` (number) : Index de la question dans list_quizz (commence à 0)

**Body (JSON) :**
```json
{
  "text": "Quelle est la vitesse maximale autorisée en ville?",
  "image": "https://example.com/new-image.jpg",
  "audio": "https://example.com/new-audio.mp3",
  "buttons": [
    {"id": "1", "title": "30 km/h"},
    {"id": "2", "title": "50 km/h"},
    {"id": "3", "title": "70 km/h"},
    {"id": "4", "title": "90 km/h"}
  ],
  "answer": {
    "text": "50 km/h",
    "audio": "https://example.com/answer.mp3"
  }
}
```

**Champs requis :**
- `text` (string)
- `buttons` (array)
- `answer.text` (string)

**Champs optionnels :**
- `image` (string)
- `audio` (string)
- `answer.audio` (string)

**Réponse :**
```json
{
  "success": true,
  "message": "Question updated successfully"
}
```

---

## Endpoints de Suppression (DELETE)

### 10. Supprimer une question d'un quiz
**DELETE** `/dashboard/quizz/:id/questions/:index`

Supprime une question spécifique d'un quiz.

**Paramètres :**
- `id` (string) : MongoDB ObjectId du quiz
- `index` (number) : Index de la question à supprimer (commence à 0)

**Réponse :**
```json
{
  "success": true,
  "message": "Question deleted successfully"
}
```

**Erreurs possibles :**
- Code 400 : Index invalide (négatif ou non numérique)
- Code 500 : Quiz ou question non trouvée

---

### 11. Supprimer un quiz complet
**DELETE** `/dashboard/quizz/:id`

Supprime un quiz et toutes ses questions de la base de données.

**Paramètres :**
- `id` (string) : MongoDB ObjectId du quiz

**Réponse :**
```json
{
  "success": true,
  "message": "Quiz deleted successfully"
}
```

**Erreurs possibles :**
```json
{
  "success": false,
  "message": "Quiz not found"
}
```

---

## Endpoints d'Upload de Fichiers

### 12. Upload d'une image pour une question
**POST** `/dashboard/quizz/:id/questions/:index/upload-image`

Upload une image pour une question spécifique et met à jour la question.

**Paramètres :**
- `id` (string) : MongoDB ObjectId du quiz
- `index` (number) : Index de la question (commence à 0)

**Body (multipart/form-data) :**
- `image` (file) : Fichier image (JPG, PNG, etc.)

**Réponse :**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "imageUrl": "https://autoecole.mojay.pro/public/assets/uploads/images/AbC1_1732739234567.jpg"
}
```

---

### 13. Upload d'un audio pour une question
**POST** `/dashboard/quizz/:id/questions/:index/upload-audio`

Upload un fichier audio pour une question spécifique.

**Paramètres :**
- `id` (string) : MongoDB ObjectId du quiz
- `index` (number) : Index de la question (commence à 0)

**Body (multipart/form-data) :**
- `audio` (file) : Fichier audio (MP3, WAV, etc.)

**Réponse :**
```json
{
  "success": true,
  "message": "Audio uploaded successfully",
  "audioUrl": "https://autoecole.mojay.pro/public/assets/uploads/audios/XyZ2_1732739234567.mp3"
}
```

---

### 14. Upload d'un audio pour la réponse
**POST** `/dashboard/quizz/:id/questions/:index/upload-answer-audio`

Upload un fichier audio pour la réponse d'une question.

**Paramètres :**
- `id` (string) : MongoDB ObjectId du quiz
- `index` (number) : Index de la question (commence à 0)

**Body (multipart/form-data) :**
- `audioanswer` (file) : Fichier audio de la réponse

**Réponse :**
```json
{
  "success": true,
  "message": "Answer audio uploaded successfully",
  "audioUrl": "https://autoecole.mojay.pro/public/assets/uploads/audios/DeF3_1732739234567.mp3"
}
```

---

### 15. Ajouter une question avec tous les fichiers
**POST** `/dashboard/quizz/:id/questions/upload-full`

Ajoute une nouvelle question avec image, audio et audio de réponse en une seule requête.

**Paramètres :**
- `id` (string) : MongoDB ObjectId du quiz

**Body (multipart/form-data) :**
- `text` (string) : Texte de la question (requis)
- `buttons` (string) : JSON stringifié des boutons (requis)
- `textAnswer` (string) : Texte de la réponse (requis)
- `image` (file, optional) : Fichier image
- `audio` (file, optional) : Fichier audio de la question
- `audioanswer` (file, optional) : Fichier audio de la réponse

**Exemple de buttons (en JSON) :**
```json
[
  {"id": "1", "title": "30 km/h"},
  {"id": "2", "title": "50 km/h"},
  {"id": "3", "title": "70 km/h"}
]
```

**Réponse :**
```json
{
  "success": true,
  "message": "Question with files added successfully",
  "question": {
    "image": "https://autoecole.mojay.pro/public/assets/uploads/images/GhI4_1732739234567.jpg",
    "text": "Quelle est la vitesse maximale en ville?",
    "audio": "https://autoecole.mojay.pro/public/assets/uploads/audios/JkL5_1732739234567.mp3",
    "buttons": [
      {"id": "1", "title": "30 km/h"},
      {"id": "2", "title": "50 km/h"},
      {"id": "3", "title": "70 km/h"}
    ],
    "answer": {
      "audio": "https://autoecole.mojay.pro/public/assets/uploads/audios/MnO6_1732739234567.mp3",
      "text": "50 km/h"
    }
  }
}
```

---

## Structure des données

### Objet Quiz complet
```json
{
  "_id": "ObjectId",
  "title": "string",
  "id_user": "ObjectId",
  "list_quizz": [
    {
      "image": "string (URL)",
      "text": "string",
      "audio": "string (URL)",
      "buttons": [
        {
          "id": "string",
          "title": "string"
        }
      ],
      "answer": {
        "audio": "string (URL)",
        "text": "string"
      }
    }
  ],
  "created_at": "Date ISO 8601",
  "update_date": "Date ISO 8601"
}
```

---

## Exemples d'utilisation avec curl

### Créer un quiz
```bash
curl -X POST https://autoecole.mojay.pro/dashboard/quizz \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Code de la Route 2025",
    "id_user": "65a03b6e2f704c698db2bba6"
  }'
```

### Ajouter une question
```bash
curl -X POST https://autoecole.mojay.pro/dashboard/quizz/QUIZ_ID/questions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "À quelle distance doit-on signaler sa sortie sur autoroute?",
    "buttons": [
      {"id": "1", "title": "100m"},
      {"id": "2", "title": "200m"},
      {"id": "3", "title": "500m"}
    ],
    "answer": {
      "text": "200m"
    }
  }'
```

### Modifier une question
```bash
curl -X PUT https://autoecole.mojay.pro/dashboard/quizz/QUIZ_ID/questions/0 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Question modifiée",
    "buttons": [
      {"id": "1", "title": "Réponse A"},
      {"id": "2", "title": "Réponse B"}
    ],
    "answer": {
      "text": "Réponse A"
    }
  }'
```

### Supprimer une question
```bash
curl -X DELETE https://autoecole.mojay.pro/dashboard/quizz/QUIZ_ID/questions/0 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Supprimer un quiz
```bash
curl -X DELETE https://autoecole.mojay.pro/dashboard/quizz/QUIZ_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Upload d'une image pour une question
```bash
curl -X POST https://autoecole.mojay.pro/dashboard/quizz/QUIZ_ID/questions/0/upload-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

### Upload d'un audio pour une question
```bash
curl -X POST https://autoecole.mojay.pro/dashboard/quizz/QUIZ_ID/questions/0/upload-audio \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@/path/to/audio.mp3"
```

### Upload d'un audio pour la réponse
```bash
curl -X POST https://autoecole.mojay.pro/dashboard/quizz/QUIZ_ID/questions/0/upload-answer-audio \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audioanswer=@/path/to/answer.mp3"
```

### Ajouter une question complète avec fichiers
```bash
curl -X POST https://autoecole.mojay.pro/dashboard/quizz/QUIZ_ID/questions/upload-full \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "text=Quelle est la vitesse maximale en ville?" \
  -F 'buttons=[{"id":"1","title":"30 km/h"},{"id":"2","title":"50 km/h"},{"id":"3","title":"70 km/h"}]' \
  -F "textAnswer=50 km/h" \
  -F "image=@/path/to/image.jpg" \
  -F "audio=@/path/to/question.mp3" \
  -F "audioanswer=@/path/to/answer.mp3"
```

---

## Notes importantes

1. **Authentification** : Tous les endpoints nécessitent un token JWT valide dans le header Authorization
2. **Format des dates** : Toutes les dates sont en format ISO 8601
3. **Index des questions** : Les questions sont indexées à partir de 0
4. **Mise à jour automatique** : Le champ `update_date` est automatiquement mis à jour lors de toute modification
5. **Validation** : Les champs requis sont validés côté serveur
6. **Upload de fichiers** :
   - Les endpoints d'upload utilisent `multipart/form-data`
   - Les fichiers sont automatiquement renommés avec un nom unique (aléatoire + timestamp)
   - Les images sont stockées dans `public/assets/uploads/images/`
   - Les audios sont stockés dans `public/assets/uploads/audios/`
   - Les URLs retournées sont accessibles publiquement
   - Formats supportés : Images (JPG, PNG, GIF, etc.), Audio (MP3, WAV, M4A, etc.)
7. **Taille des fichiers** : Vérifiez les limites de taille configurées dans express-fileupload

---

## Codes d'erreur HTTP

- `200` : Succès (GET, PUT, DELETE)
- `201` : Ressource créée (POST)
- `400` : Requête invalide (paramètres manquants ou invalides)
- `404` : Ressource non trouvée
- `500` : Erreur serveur interne

---

## Script de test complet

Un script de test bash est disponible à : `/home/ec2-user/test_quiz_crud.sh`

Pour l'exécuter :
```bash
chmod +x /home/ec2-user/test_quiz_crud.sh
/home/ec2-user/test_quiz_crud.sh
```

Ce script teste tous les endpoints CRUD dans l'ordre logique.
