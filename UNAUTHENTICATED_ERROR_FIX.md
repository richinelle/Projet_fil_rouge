# 🔐 Correction - Erreur "Unauthenticated"

## 🎯 Problème

Erreur "Unauthenticated" lors de l'accès à certaines routes.

---

## 🔍 Cause

Le problème vient de plusieurs sources possibles:

### 1. Token JWT Invalide ou Expiré
- Le token n'est pas stocké dans `localStorage`
- Le token est expiré
- Le token est mal formaté

### 2. Authentification Non Effectuée
- L'utilisateur n'est pas connecté
- La session a expiré
- Le token a été supprimé

### 3. Mauvaise Route
- La route nécessite une authentification
- Le token n'est pas envoyé avec la requête
- Le header `Authorization` est mal formaté

---

## ✅ Solutions

### Solution 1: Vérifier que l'Utilisateur est Connecté

**Dans la Console du Navigateur (F12)**:
```javascript
// Vérifier le token
console.log('Token:', localStorage.getItem('token'))

// Vérifier le candidat
console.log('Candidat:', localStorage.getItem('candidate'))

// Vérifier le rôle
console.log('Rôle:', localStorage.getItem('userRole'))
```

**Si le token est vide**:
1. Connectez-vous à nouveau
2. Vérifiez que la connexion a réussi
3. Vérifiez que le token est stocké

### Solution 2: Corriger le Client API

**Fichier**: `Frontend/src/api/client.js`

Le client API doit ajouter le token à chaque requête:

```javascript
import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Ajouter le token à chaque requête
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default client
```

### Solution 3: Corriger les Routes Publiques

**Fichier**: `Backend/routes/api.php`

Les routes publiques ne doivent pas nécessiter d'authentification:

```php
// Routes publiques (pas d'authentification requise)
Route::get('/contests', [ContestController::class, 'listContests']);
Route::get('/contests/{contestId}', [ContestController::class, 'getContestDetails']);
Route::get('/departments', [DepartmentController::class, 'index']);
Route::get('/filieres/by-department/{departmentId}', [FiliereController::class, 'getByDepartment']);
Route::get('/exam-centers', [ExamCenterController::class, 'index']);
Route::get('/deposit-centers', [DepositCenterController::class, 'index']);

// Routes protégées (authentification requise)
Route::middleware('auth:api')->group(function () {
    // Routes authentifiées
});
```

### Solution 4: Corriger les Appels API

**Fichier**: `Frontend/src/pages/ContestsSelection.jsx`

Les routes publiques ne doivent pas envoyer le token:

```javascript
// ❌ Mauvais (envoie le token pour une route publique)
const response = await axios.get('http://localhost:8000/api/contests', {
  headers: { Authorization: `Bearer ${token}` },
})

// ✅ Correct (pas de token pour une route publique)
const response = await axios.get('http://localhost:8000/api/contests')

// ✅ Correct (utilise le client API qui ajoute le token automatiquement)
import client from '../api/client'
const response = await client.get('/contests')
```

---

## 🔧 Changements Effectués

### 1. ContestsSelection.jsx

**Avant**:
```javascript
const response = await axios.get('http://localhost:8000/api/contests', {
  headers: { Authorization: `Bearer ${token}` },
})
```

**Après**:
```javascript
const response = await axios.get('http://localhost:8000/api/contests')
```

**Raison**: La route `/api/contests` est publique et ne nécessite pas d'authentification.

### 2. fetchPaidContests

**Avant**:
```javascript
const response = await axios.get('http://localhost:8000/api/my-contests', {
  headers: { Authorization: `Bearer ${token}` },
})
```

**Après**:
```javascript
if (!token) return

const response = await axios.get('http://localhost:8000/api/my-contests', {
  headers: { Authorization: `Bearer ${token}` },
})
```

**Raison**: Vérifier que le token existe avant d'appeler une route protégée.

---

## 🧪 Vérification

### Vérifier que les Concours Chargent

1. Connectez-vous en tant que candidat
2. Allez à `/contests-selection`
3. Vérifiez que les concours s'affichent
4. Ouvrez la console (F12)
5. Vérifiez qu'il n'y a pas d'erreurs

### Vérifier le Token

```javascript
// Dans la console du navigateur
const token = localStorage.getItem('token')
console.log('Token existe:', !!token)
console.log('Token valide:', token && token.length > 50)
```

### Vérifier les Requêtes

1. Ouvrez F12
2. Allez à l'onglet "Network"
3. Rechargez la page
4. Vérifiez les requêtes:
   - `GET /api/contests` - Doit retourner 200
   - `GET /api/my-contests` - Doit retourner 200 (avec token)

---

## 📊 Flux Correct

```
1. Utilisateur se connecte
   ↓
2. Token est stocké dans localStorage
   ↓
3. Utilisateur va à /contests-selection
   ↓
4. Page charge les concours publics (GET /api/contests)
   ↓
5. Page charge les concours payés (GET /api/my-contests avec token)
   ↓
6. Concours s'affichent
   ↓
7. Utilisateur peut effectuer un paiement
```

---

## 🐛 Dépannage

### Erreur: "Unauthenticated" sur /api/contests

**Cause**: La route est publique mais le token est envoyé

**Solution**: Ne pas envoyer le token pour les routes publiques

### Erreur: "Unauthenticated" sur /api/my-contests

**Cause**: Le token n'est pas envoyé ou est invalide

**Solution**:
1. Vérifiez que l'utilisateur est connecté
2. Vérifiez que le token est valide
3. Vérifiez que le token est envoyé avec la requête

### Erreur: "Unauthenticated" sur /api/payment/initiate

**Cause**: Le token n'est pas envoyé ou est invalide

**Solution**:
1. Vérifiez que l'utilisateur est connecté
2. Vérifiez que le token est valide
3. Utilisez le client API qui ajoute le token automatiquement

---

## 📋 Checklist

- [ ] L'utilisateur est connecté
- [ ] Le token est stocké dans localStorage
- [ ] Le token est valide
- [ ] Les routes publiques ne nécessitent pas d'authentification
- [ ] Les routes protégées nécessitent l'authentification
- [ ] Le client API ajoute le token automatiquement
- [ ] Les concours s'affichent
- [ ] Le paiement fonctionne

---

## 📞 Support

Si vous avez besoin d'aide:
1. Vérifiez la console du navigateur (F12)
2. Vérifiez les logs du backend
3. Vérifiez que l'utilisateur est connecté
4. Contactez le support technique

---

**Status**: ✅ **CORRECTION EFFECTUÉE**

**Date**: 23 Janvier 2026
**Auteur**: Kiro AI Assistant
