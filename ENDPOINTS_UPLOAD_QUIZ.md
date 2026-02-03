# Endpoints d'Upload pour Quiz - Guide Complet

## 📤 Vue d'ensemble

**Base URL** : `https://autoecole.mojay.pro/dashboard`

**Authentification requise** : `Authorization: Bearer <token>`

**Content-Type** : `multipart/form-data` (automatique avec `-F` dans curl)

---

## 🖼️ 1. Upload d'une Image pour une Question

**Endpoint** : `POST /dashboard/quizz/:id/questions/:index/upload-image`

### Description
Upload une image pour une question existante et met à jour automatiquement la question.

### Paramètres URL
- `id` : MongoDB ObjectId du quiz
- `index` : Index de la question (commence à 0)

### Body (multipart/form-data)
```
image: [fichier image]
```

### Exemple curl
```bash
curl -X POST "https://autoecole.mojay.pro/dashboard/quizz/667ae5aa6cf4978137fb0b19/questions/0/upload-image" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/chemin/vers/image.jpg"
```

### Réponse Succès (200)
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "imageUrl": "https://autoecole.mojay.pro/public/assets/uploads/images/NHAz_1719331127553.jpg"
}
```

### Formats supportés
JPG, JPEG, PNG, GIF, WebP

### Notes
- Le fichier est automatiquement renommé : `[4lettres]_[timestamp].[extension]`
- L'URL retournée est accessible publiquement
- Les autres champs de la question sont préservés

---

## 🎵 2. Upload d'un Audio pour une Question

**Endpoint** : `POST /dashboard/quizz/:id/questions/:index/upload-audio`

### Description
Upload un fichier audio pour la question (énoncé audio).

### Paramètres URL
- `id` : MongoDB ObjectId du quiz
- `index` : Index de la question (commence à 0)

### Body (multipart/form-data)
```
audio: [fichier audio]
```

### Exemple curl
```bash
curl -X POST "https://autoecole.mojay.pro/dashboard/quizz/667ae5aa6cf4978137fb0b19/questions/0/upload-audio" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@/chemin/vers/question.mp3"
```

### Réponse Succès (200)
```json
{
  "success": true,
  "message": "Audio uploaded successfully",
  "audioUrl": "https://autoecole.mojay.pro/public/assets/uploads/audios/xWD9_1720099592069.mp3"
}
```

### Formats supportés
MP3, WAV, M4A, OGG

### Notes
- Stocké dans `/public/assets/uploads/audios/`
- Compatible avec le format existant dans la base de données

---

## 🔊 3. Upload d'un Audio pour la Réponse

**Endpoint** : `POST /dashboard/quizz/:id/questions/:index/upload-answer-audio`

### Description
Upload un fichier audio pour l'explication de la réponse.

### Paramètres URL
- `id` : MongoDB ObjectId du quiz
- `index` : Index de la question (commence à 0)

### Body (multipart/form-data)
```
audioanswer: [fichier audio]
```

### Exemple curl
```bash
curl -X POST "https://autoecole.mojay.pro/dashboard/quizz/667ae5aa6cf4978137fb0b19/questions/0/upload-answer-audio" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audioanswer=@/chemin/vers/reponse.mp3"
```

### Réponse Succès (200)
```json
{
  "success": true,
  "message": "Answer audio uploaded successfully",
  "audioUrl": "https://autoecole.mojay.pro/public/assets/uploads/audios/reponse_signalisaionhorizontale.mp3"
}
```

### Formats supportés
MP3, WAV, M4A, OGG

### Notes
- Champ distinct de l'audio de la question
- Correspond au champ `answer.audio` dans la base de données

---

## 📦 4. Ajouter une Question Complète avec Fichiers

**Endpoint** : `POST /dashboard/quizz/:id/questions/upload-full`

### Description
Ajoute une nouvelle question avec image + audio question + audio réponse en une seule requête.

### Paramètres URL
- `id` : MongoDB ObjectId du quiz

### Body (multipart/form-data)

#### Champs requis
```
text: [string] - Texte de la question
buttons: [string JSON] - Array des boutons de réponse
textAnswer: [string] - Texte de la réponse correcte
```

#### Champs optionnels (fichiers)
```
image: [fichier] - Image de la question
audio: [fichier] - Audio de la question
audioanswer: [fichier] - Audio de la réponse
```

### Exemple complet avec tous les fichiers
```bash
curl -X POST "https://autoecole.mojay.pro/dashboard/quizz/667ae5aa6cf4978137fb0b19/questions/upload-full" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "text=À quoi correspond la signalisation horizontale ? \r\n\r\n  🟩  Les panneaux indicateurs \r\n\r\n  🟨   Le marquage au sol" \
  -F 'buttons=[{"value":"false","title":"A 🟩"},{"value":"true","title":"B 🟨"}]' \
  -F "textAnswer=La signalisation horizontale est représentée par le marquage au sol dans la signalisation routière." \
  -F "image=@/chemin/vers/signalisation.png" \
  -F "audio=@/chemin/vers/question.mp3" \
  -F "audioanswer=@/chemin/vers/reponse.mp3"
```

### Exemple sans fichiers (URLs vides)
```bash
curl -X POST "https://autoecole.mojay.pro/dashboard/quizz/667ae5aa6cf4978137fb0b19/questions/upload-full" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "text=Quelle est la vitesse maximale en ville?" \
  -F 'buttons=[{"value":"false","title":"30 km/h"},{"value":"true","title":"50 km/h"},{"value":"false","title":"70 km/h"}]' \
  -F "textAnswer=La vitesse maximale en ville est de 50 km/h."
```

### Réponse Succès (201)
```json
{
  "success": true,
  "message": "Question with files added successfully",
  "question": {
    "image": "https://autoecole.mojay.pro/public/assets/uploads/images/NHAz_1719331127553.png",
    "text": "À quoi correspond la signalisation horizontale ? ...",
    "audio": "https://autoecole.mojay.pro/public/assets/uploads/audios/rassguisstest.mp3",
    "buttons": [
      {"value": "false", "title": "A 🟩"},
      {"value": "true", "title": "B 🟨"}
    ],
    "answer": {
      "audio": "https://autoecole.mojay.pro/public/assets/uploads/audios/reponse_signalisaionhorizontale.mp3",
      "text": "La signalisation horizontale est représentée par le marquage au sol..."
    }
  }
}
```

### Format des buttons
Le champ `buttons` doit être un JSON stringifié. Exemples :

#### Pour un vrai/faux
```json
[
  {"value": "false", "title": "A 🟩"},
  {"value": "true", "title": "B 🟨"}
]
```

#### Pour un QCM
```json
[
  {"title": "A 🟩", "value": "false"},
  {"title": "B 🟥", "value": "true"},
  {"title": "C 🟨", "value": "false"}
]
```

### Notes
- Les fichiers sont tous optionnels
- Si un fichier n'est pas fourni, l'URL sera vide (`""` ou `null`)
- La question est automatiquement ajoutée à la fin du tableau `list_quizz`

---

## 🔄 Workflow Recommandés

### Workflow 1 : Création progressive

```bash
# 1. Créer le quiz
curl -X POST "https://autoecole.mojay.pro/dashboard/quizz" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Code de la Route 2025"}'
# Récupère QUIZ_ID

# 2. Ajouter question (sans fichiers)
curl -X POST "https://autoecole.mojay.pro/dashboard/quizz/QUIZ_ID/questions" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text":"Question de test?",
    "buttons":[{"id":"1","title":"Oui"},{"id":"2","title":"Non"}],
    "answer":{"text":"Oui"}
  }'

# 3. Upload image pour la question 0
curl -X POST "https://autoecole.mojay.pro/dashboard/quizz/QUIZ_ID/questions/0/upload-image" \
  -H "Authorization: Bearer TOKEN" \
  -F "image=@image.jpg"

# 4. Upload audio question pour la question 0
curl -X POST "https://autoecole.mojay.pro/dashboard/quizz/QUIZ_ID/questions/0/upload-audio" \
  -H "Authorization: Bearer TOKEN" \
  -F "audio=@question.mp3"

# 5. Upload audio réponse pour la question 0
curl -X POST "https://autoecole.mojay.pro/dashboard/quizz/QUIZ_ID/questions/0/upload-answer-audio" \
  -H "Authorization: Bearer TOKEN" \
  -F "audioanswer=@reponse.mp3"
```

### Workflow 2 : Création tout-en-un (RECOMMANDÉ)

```bash
# 1. Créer le quiz
curl -X POST "https://autoecole.mojay.pro/dashboard/quizz" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Code de la Route 2025"}'
# Récupère QUIZ_ID

# 2. Ajouter question avec tous les fichiers en une fois
curl -X POST "https://autoecole.mojay.pro/dashboard/quizz/QUIZ_ID/questions/upload-full" \
  -H "Authorization: Bearer TOKEN" \
  -F "text=Votre question ici?" \
  -F 'buttons=[{"value":"false","title":"A"},{"value":"true","title":"B"}]' \
  -F "textAnswer=Votre réponse ici" \
  -F "image=@image.jpg" \
  -F "audio=@question.mp3" \
  -F "audioanswer=@reponse.mp3"
```

### Workflow 3 : Mise à jour d'une question existante

```bash
# 1. Remplacer l'image d'une question existante
curl -X POST "https://autoecole.mojay.pro/dashboard/quizz/667ae5aa6cf4978137fb0b19/questions/2/upload-image" \
  -H "Authorization: Bearer TOKEN" \
  -F "image=@nouvelle-image.jpg"

# 2. Ajouter un audio à une question qui n'en avait pas
curl -X POST "https://autoecole.mojay.pro/dashboard/quizz/667ae5aa6cf4978137fb0b19/questions/4/upload-audio" \
  -H "Authorization: Bearer TOKEN" \
  -F "audio=@nouvel-audio.mp3"
```

---

## ❌ Gestion des Erreurs

### Erreur 400 : Index invalide
```json
{
  "success": false,
  "message": "Invalid question index"
}
```
**Cause** : L'index est négatif ou non numérique

### Erreur 400 : Fichier manquant
```json
{
  "success": false,
  "message": "No image file provided"
}
```
**Cause** : Le champ `image` (ou `audio`/`audioanswer`) est absent dans la requête

### Erreur 404 : Question non trouvée
```json
{
  "success": false,
  "message": "Quiz or question not found"
}
```
**Cause** : Le quiz ou l'index de question n'existe pas

### Erreur 500 : Erreur serveur
```json
{
  "error": "Internal server error",
  "message": "Détails de l'erreur"
}
```
**Cause** : Problème lors du déplacement du fichier ou de la mise à jour de la base

---

## 📁 Stockage et Chemins

### Structure des dossiers
```
/home/ec2-user/PeeloCalendar/
└── public/
    └── assets/
        └── uploads/
            ├── images/          ← Images des questions
            │   ├── NHAz_1719331127553.png
            │   ├── MF4H_1719331493925.png
            │   └── DcrV_1719331999047.jpeg
            └── audios/          ← Audios questions + réponses
                ├── rassguisstest.mp3
                ├── xWD9_1720099592069.mp3
                ├── reponse_signalisaionhorizontale.mp3
                └── ligne_dissuasion_bi.m4a
```

### Format des noms de fichiers
`[4_caracteres_aleatoires]_[timestamp_millisecondes].[extension]`

Exemples :
- `NHAz_1719331127553.png`
- `xWD9_1720099592069.mp3`
- `MF4H_1719331493925.png`

### URLs publiques
- **Images** : `https://autoecole.mojay.pro/public/assets/uploads/images/[filename]`
- **Audios** : `https://autoecole.mojay.pro/public/assets/uploads/audios/[filename]`

---

## 🔐 Authentification

### Token JWT requis
```bash
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Mode développement (actuellement actif)
⚠️ L'authentification est temporairement en mode bypass. Un mock user est injecté :
```javascript
{
  _id: '65a03b6e2f704c698db2bba6',
  displayName: 'Mamadou DIEYE',
  email: 'dieyebow@gmail.com'
}
```

---

## 💡 Conseils et Bonnes Pratiques

### 1. Optimisation des images
- Compresser les images avant l'upload
- Formats recommandés : JPG (photos), PNG (illustrations)
- Taille recommandée : max 1920x1080px

### 2. Optimisation des audios
- Format recommandé : MP3 avec bitrate 128kbps
- Normaliser le volume audio
- Durée recommandée : 10-30 secondes pour les questions

### 3. Nommage cohérent
- Utiliser des noms de fichiers descriptifs avant l'upload
- Exemple : `signalisation_horizontale_question.png`
- Le système renommera automatiquement mais c'est utile pour l'organisation locale

### 4. Gestion des erreurs
- Toujours vérifier la réponse `success: true`
- Stocker les URLs retournées pour une utilisation ultérieure
- Implémenter un système de retry en cas d'échec réseau

### 5. Performance
- Utiliser `/upload-full` pour ajouter une question complète en une seule requête
- Éviter les uploads multiples séquentiels si possible

---

## 🧪 Tests

### Script de test simple
```bash
#!/bin/bash

TOKEN="YOUR_JWT_TOKEN"
QUIZ_ID="667ae5aa6cf4978137fb0b19"

echo "Test 1: Upload image"
curl -X POST "https://autoecole.mojay.pro/dashboard/quizz/$QUIZ_ID/questions/0/upload-image" \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@test-image.jpg"

echo -e "\n\nTest 2: Upload audio"
curl -X POST "https://autoecole.mojay.pro/dashboard/quizz/$QUIZ_ID/questions/0/upload-audio" \
  -H "Authorization: Bearer $TOKEN" \
  -F "audio=@test-audio.mp3"

echo -e "\n\nTest 3: Upload complet"
curl -X POST "https://autoecole.mojay.pro/dashboard/quizz/$QUIZ_ID/questions/upload-full" \
  -H "Authorization: Bearer $TOKEN" \
  -F "text=Question de test?" \
  -F 'buttons=[{"value":"true","title":"Oui"},{"value":"false","title":"Non"}]' \
  -F "textAnswer=La réponse est Oui" \
  -F "image=@test-image.jpg" \
  -F "audio=@test-audio.mp3" \
  -F "audioanswer=@test-answer.mp3"
```

---

## 📞 Support

### Vérification des logs
```bash
pm2 logs autoecole --lines 50
```

### Vérifier les fichiers uploadés
```bash
ls -lh /home/ec2-user/PeeloCalendar/public/assets/uploads/images/
ls -lh /home/ec2-user/PeeloCalendar/public/assets/uploads/audios/
```

### Tester l'accessibilité d'un fichier
```bash
curl -I https://autoecole.mojay.pro/public/assets/uploads/images/NHAz_1719331127553.png
```

---

## 📝 Changelog

### Version 1.0 (2025-11-27)
- ✅ Endpoint d'upload d'image pour question
- ✅ Endpoint d'upload d'audio pour question
- ✅ Endpoint d'upload d'audio pour réponse
- ✅ Endpoint d'upload complet (question + fichiers)
- ✅ Génération automatique de noms uniques
- ✅ Compatibilité avec la structure existante

---

**Documentation complète** : `/home/ec2-user/PeeloCalendar/ENDPOINTS_QUIZ_API.md`

**Résumé des endpoints** : `/home/ec2-user/PeeloCalendar/RESUME_ENDPOINTS_QUIZ.md`

**Script de test CRUD** : `/home/ec2-user/test_quiz_crud.sh`
