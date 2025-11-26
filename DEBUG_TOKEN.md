# 🐛 Guide de Debug - Token JWT

## Logs ajoutés dans authenticateToken

J'ai ajouté des console.log détaillés dans la fonction `authenticateToken` pour vous aider à déboguer.

---

## 📋 Ce que vous verrez dans les logs

### Quand vous faites une requête

```bash
curl -H "Authorization: Bearer VOTRE_TOKEN" \
  https://autoecole.mojay.pro/dashboard/students/count
```

### Dans les logs PM2, vous verrez :

```
========== authenticateToken DEBUG ==========
URL: /dashboard/students/count
Authorization Header: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7...
SECRET_KEY_JWT: DÉFINI
✅ Token valide pour user: dieyebow@gmail.com
=============================================
```

### Si le token est expiré :

```
========== authenticateToken DEBUG ==========
URL: /dashboard/students/count
Authorization Header: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7...
SECRET_KEY_JWT: DÉFINI
❌ Erreur JWT: TokenExpiredError - jwt expired
=============================================
```

### Si le header est manquant :

```
========== authenticateToken DEBUG ==========
URL: /dashboard/students/count
Authorization Header: MANQUANT
SECRET_KEY_JWT: DÉFINI
❌ Erreur: Authorization header manquant
=============================================
```

---

## 🔍 Comment voir les logs en temps réel

```bash
# Voir les logs de l'API autoecole
pm2 logs autoecole

# Ou seulement les nouvelles lignes
pm2 logs autoecole --lines 0
```

---

## 🧪 Tester et voir les logs

### 1. Ouvrir un terminal pour les logs
```bash
pm2 logs autoecole --lines 0
```

### 2. Dans un autre terminal, faire une requête
```bash
TOKEN="VOTRE_TOKEN"
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/students/count
```

### 3. Observer les logs

Vous verrez immédiatement dans le premier terminal les informations de debug.

---

## 📊 Les différentes erreurs possibles

### TokenExpiredError
```
❌ Erreur JWT: TokenExpiredError - jwt expired
```
**Solution**: Générer un nouveau token

### JsonWebTokenError
```
❌ Erreur JWT: JsonWebTokenError - invalid token
```
**Solution**: Vérifier que le token est complet et valide

### Header manquant
```
❌ Erreur: Authorization header manquant
```
**Solution**: Ajouter le header `Authorization: Bearer TOKEN`

---

## 🔧 Générer un nouveau token

### Méthode 1: Via l'application
1. Connectez-vous sur https://autoecole.mojay.pro/connexion
2. Ouvrez DevTools (F12) > Network
3. Faites une action (ex: voir la liste des élèves)
4. Copiez le token depuis les headers de la requête

### Méthode 2: Via curl
```bash
# Connexion pour obtenir un token
curl -X POST https://autoecole.mojay.pro/check/user \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "displayName": "Mamadou DIEYE",
      "photoURL": "https://...",
      "email": "dieyebow@gmail.com",
      "stsTokenManager": {
        "accessToken": "...",
        "refreshToken": "..."
      }
    }
  }'
```

---

## 📝 Exemple complet de test

```bash
#!/bin/bash

# 1. Définir le token (À REMPLACER)
TOKEN="VOTRE_NOUVEAU_TOKEN"

# 2. Tester le health check (sans auth)
echo "Test 1: Health Check (sans auth)"
curl https://autoecole.mojay.pro/dashboard/health
echo -e "\n"

# 3. Tester avec auth
echo "Test 2: Students Count (avec auth)"
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/students/count
echo -e "\n"

# 4. Voir les logs
echo "Vérifiez les logs avec: pm2 logs autoecole"
```

---

## 🎯 Checklist de dépannage

- [ ] Vérifier que l'API est en ligne: `pm2 list`
- [ ] Vérifier les logs: `pm2 logs autoecole --lines 50`
- [ ] Tester le health check: `curl https://autoecole.mojay.pro/dashboard/health`
- [ ] Vérifier que le token est complet (pas de coupure)
- [ ] Vérifier le format du header: `Authorization: Bearer TOKEN` (avec Bearer)
- [ ] Générer un nouveau token si expiré

---

## 💡 Astuce

Pour tester rapidement avec un nouveau token:

```bash
# Ouvrir les logs dans un terminal
pm2 logs autoecole --lines 0

# Dans un autre terminal, tester
export TOKEN="NOUVEAU_TOKEN"
curl -H "Authorization: Bearer $TOKEN" \
  https://autoecole.mojay.pro/dashboard/kpis/global | python3 -m json.tool
```

Les logs vous montreront exactement ce qui se passe !

---

**Les logs de debug resteront actifs.** Vous pouvez les consulter à tout moment avec `pm2 logs autoecole`.
