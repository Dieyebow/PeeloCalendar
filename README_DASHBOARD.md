# 🚗 PeeloCar Dashboard API - Guide Complet

## 📋 Vue d'ensemble

L'API du tableau de bord PeeloCar fournit **34 endpoints** pour accéder aux données des 6 collections MongoDB principales du système PeeloCar. Toutes les routes sont préfixées par `/dashboard` et intégrées dans le serveur `autoecole.js` (port 7568).

---

## 📁 Fichiers du Projet

| Fichier | Description |
|---------|-------------|
| [peelocarDashboard.js](peelocarDashboard.js) | Module de routes (34 endpoints) |
| [DASHBOARD_API.md](DASHBOARD_API.md) | Documentation technique complète |
| [LIENS_DASHBOARD.md](LIENS_DASHBOARD.md) | Guide d'utilisation avec exemples |
| [test_dashboard.sh](test_dashboard.sh) | Script de tests automatisé |
| [RESULTATS_TESTS.md](RESULTATS_TESTS.md) | Résultats des tests |
| [README_DASHBOARD.md](README_DASHBOARD.md) | Ce fichier |

---

## 🚀 Démarrage Rapide

### 1. L'API est déjà en marche !
L'API Dashboard est intégrée dans `autoecole.js` qui tourne sur PM2:
```bash
pm2 list
# Vérifier que 'autoecole' est en ligne
```

### 2. Test de santé
```bash
curl http://localhost:7568/dashboard/health
```

### 3. Obtenir un token JWT
Le token JWT est requis pour toutes les routes sauf `/dashboard/health`.
Connectez-vous via l'application et récupérez le token.

### 4. Tester une route
```bash
TOKEN="VOTRE_TOKEN_ICI"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:7568/dashboard/kpis/global
```

---

## 📊 Collections Couvertes

### 1. **autoecole_user** (Administrateurs)
- 👥 Nombre d'admins
- 📋 Liste des admins

### 2. **autoecoles** (Auto-écoles)
- 🏫 Nombre d'auto-écoles
- 📋 Liste avec stats
- 👥 Élèves par auto-école

### 3. **autoecoles_current_user** (Élèves)
- 🎓 Nombre d'élèves
- 📋 Liste avec recherche
- 🔍 Filtres (premium, actifs, par date)
- 📈 Stats d'inscription

### 4. **autoecoles_quizz** (Quiz)
- 📝 Nombre de quiz
- 📋 Liste des quiz
- 📊 Statistiques
- 🏆 Quiz populaires

### 5. **autoecoles_quizz_test** (Résultats)
- ✅ Nombre de tests
- 📊 Statistiques globales
- 🎯 Tests par élève/quiz
- 🏆 Classement (leaderboard)
- ⏰ Activité récente

### 6. **autoecoles_courses** (Cours)
- 📚 Nombre de cours
- 📋 Liste des cours
- 📊 Statistiques

---

## 🎯 Routes Principales

### KPIs & Dashboard Principal
```
GET /dashboard/kpis/global           # Vue d'ensemble complète ⭐
GET /dashboard/kpis/engagement       # Engagement élèves
GET /dashboard/kpis/performance      # Performance quiz
GET /dashboard/kpis/growth           # Croissance
```

### Auto-écoles
```
GET /dashboard/autoecoles/count      # Nombre total
GET /dashboard/autoecoles/list       # Liste
GET /dashboard/autoecoles/stats      # Stats détaillées ⭐
GET /dashboard/autoecoles/:id/students # Élèves d'une AE
```

### Élèves
```
GET /dashboard/students/count        # Nombre total
GET /dashboard/students/list         # Liste avec recherche ⭐
GET /dashboard/students/premium      # Élèves premium
GET /dashboard/students/active       # Élèves actifs
GET /dashboard/students/by-date      # Inscriptions par date
```

### Quiz & Tests
```
GET /dashboard/quizz/list            # Liste des quiz
GET /dashboard/quizz/popular         # Quiz populaires ⭐
GET /dashboard/tests/stats           # Stats globales
GET /dashboard/tests/recent          # Tests récents ⭐
GET /dashboard/tests/leaderboard     # Classement ⭐
```

⭐ = Routes recommandées pour le dashboard

---

## 💻 Exemples d'Utilisation

### Frontend React/Vue/Angular

```javascript
// Configuration
const API_BASE = 'http://localhost:7568';
const token = localStorage.getItem('authToken');

// Fonction fetch générique
async function fetchDashboard(endpoint) {
  const response = await fetch(`${API_BASE}/dashboard/${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

// Utilisation
const kpis = await fetchDashboard('kpis/global');
const students = await fetchDashboard('students/list?page=1&limit=10');
const leaderboard = await fetchDashboard('tests/leaderboard?limit=10');
```

### Curl (Tests)

```bash
# Variables
BASE_URL="http://localhost:7568"
TOKEN="votre_token_jwt"

# KPIs globaux
curl -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/dashboard/kpis/global"

# Liste des élèves avec recherche
curl -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/dashboard/students/list?page=1&limit=10&search=Fatou"

# Classement top 10
curl -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/dashboard/tests/leaderboard?limit=10"
```

---

## 📈 Suggestions de Widgets Dashboard

### Page d'Accueil

**1. Cartes KPIs (4 cartes)**
- Endpoint: `GET /dashboard/kpis/global`
- Affichage: Auto-écoles, Élèves, Quiz, Tests

**2. Graphique de Croissance**
- Endpoint: `GET /dashboard/kpis/growth`
- Type: Graphique linéaire
- Données: Nouveaux élèves par jour

**3. Activité Récente**
- Endpoint: `GET /dashboard/tests/recent?limit=10`
- Type: Timeline
- Données: 10 derniers tests avec noms et scores

**4. Top Performers**
- Endpoint: `GET /dashboard/tests/leaderboard?limit=5`
- Type: Liste classée
- Données: 5 meilleurs élèves avec badges

### Page Auto-écoles

**Tableau des Auto-écoles**
- Endpoint: `GET /dashboard/autoecoles/stats`
- Colonnes: Nom, Téléphone, Admin, Nb Élèves
- Tri: Par nombre d'élèves (desc)

### Page Élèves

**Liste avec Recherche**
- Endpoint: `GET /dashboard/students/list?search=X`
- Fonctionnalités: Recherche, pagination, filtres

**Stats Élèves**
- Endpoints:
  - `/dashboard/students/count`
  - `/dashboard/students/premium`
  - `/dashboard/students/active`

### Page Performance

**Stats Globales**
- Endpoint: `GET /dashboard/tests/stats`
- Affichage: Score moyen, min, max, total tests

**Classement Complet**
- Endpoint: `GET /dashboard/tests/leaderboard?limit=50`
- Type: Tableau avec podium

---

## 🔧 Configuration Nginx (Production)

Si vous souhaitez exposer l'API via Nginx:

```nginx
# /etc/nginx/sites-available/autoecole-api

server {
    listen 80;
    server_name api.autoecole.mojay.pro;

    location /dashboard/ {
        proxy_pass http://localhost:7568/dashboard/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 🧪 Tests

### Test automatique
```bash
cd /home/ec2-user/PeeloCalendar

# Mettre à jour le token dans le script
nano test_dashboard.sh

# Lancer les tests
./test_dashboard.sh
```

### Test manuel d'une route
```bash
# Health check (sans auth)
curl http://localhost:7568/dashboard/health

# Avec authentification
TOKEN="votre_token"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:7568/dashboard/kpis/global
```

---

## 🐛 Dépannage

### L'API ne répond pas
```bash
# Vérifier le statut PM2
pm2 list

# Vérifier les logs
pm2 logs autoecole --lines 50

# Redémarrer
pm2 restart autoecole
```

### Erreur 403 Forbidden
- **Cause**: Token JWT expiré
- **Solution**: Générer un nouveau token via l'application

### Erreur 500 Internal Server Error
- **Cause**: Erreur MongoDB ou code
- **Solution**: Vérifier les logs PM2

```bash
pm2 logs autoecole --err --lines 100
```

---

## 📚 Documentation

| Document | Contenu |
|----------|---------|
| [DASHBOARD_API.md](DASHBOARD_API.md) | Documentation technique détaillée avec exemples de réponses |
| [LIENS_DASHBOARD.md](LIENS_DASHBOARD.md) | Tous les liens organisés avec suggestions d'utilisation |
| [RESULTATS_TESTS.md](RESULTATS_TESTS.md) | Résultats des tests + guide de génération token |

---

## 🎓 Structure MongoDB

```
peelo (database)
├── autoecole_user           # Admins
├── autoecoles               # Auto-écoles
├── autoecoles_current_user  # Élèves
├── autoecoles_quizz         # Quiz
├── autoecoles_quizz_test    # Résultats
└── autoecoles_courses       # Cours
```

---

## 🔐 Sécurité

- ✅ Authentification JWT obligatoire
- ✅ CORS activé
- ✅ Validation des paramètres
- ✅ Gestion des erreurs
- ⚠️ En production: Ajouter rate limiting

---

## 🚀 Performance

### Optimisations implémentées
- Pagination sur toutes les listes
- Aggregations MongoDB optimisées
- Projections pour limiter les données retournées

### Recommandations
- Cache côté frontend (React Query, SWR)
- Refresh automatique toutes les 30s
- Lazy loading des listes

---

## 📊 Statistiques du Projet

- **34 endpoints** implémentés
- **6 collections** MongoDB couvertes
- **4 documents** de documentation
- **1 script** de tests automatisé
- **100% fonctionnel** ✅

---

## 👥 Support

Pour toute question ou problème:
1. Vérifier les logs: `pm2 logs autoecole`
2. Consulter [DASHBOARD_API.md](DASHBOARD_API.md)
3. Tester avec [test_dashboard.sh](test_dashboard.sh)

---

## 📝 Changelog

### v1.0.0 (2025-11-19)
- ✅ Implémentation complète des 34 endpoints
- ✅ Documentation exhaustive
- ✅ Script de tests
- ✅ Intégration dans autoecole.js

---

## ✅ Checklist d'Intégration Frontend

- [ ] Configurer l'URL de base (`http://localhost:7568`)
- [ ] Implémenter la gestion du token JWT
- [ ] Créer les services API (fetch functions)
- [ ] Créer les composants de cartes KPI
- [ ] Créer les composants de tableaux
- [ ] Créer les composants de graphiques
- [ ] Implémenter la pagination
- [ ] Implémenter la recherche/filtres
- [ ] Gérer les états de chargement
- [ ] Gérer les erreurs (401, 403, 500)
- [ ] Ajouter le cache (React Query/SWR)
- [ ] Tester avec données réelles
- [ ] Optimiser les performances

---

**🎉 Le tableau de bord PeeloCar est prêt à être utilisé !**

**Développé avec ❤️ pour PeeloCar**
**Version**: 1.0.0
**Date**: 2025-11-19
