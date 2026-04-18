# Guide de test

## Prérequis
- Backend en cours d'exécution sur `http://localhost:8000`
- Frontend en cours d'exécution sur `http://localhost:5173`
- MySQL en cours d'exécution

## Test manuel

### 1. Test de la page d'accueil
1. Ouvrez `http://localhost:5173` dans votre navigateur
2. Vérifiez que la page d'accueil s'affiche correctement
3. Vérifiez que les boutons "S'inscrire" et "Se connecter" sont visibles

### 2. Test de l'inscription
1. Cliquez sur "S'inscrire"
2. Remplissez le formulaire avec:
   - Prénom: Jean
   - Nom: Dupont
   - Email: jean@example.com
   - Téléphone: +33612345678
   - Mot de passe: password123
   - Confirmation: password123
3. Cliquez sur "S'inscrire"
4. Vérifiez que vous êtes redirigé vers la page de vérification d'email

### 3. Test de la vérification d'email
1. Vérifiez que vous avez reçu un email avec le code de vérification
2. Entrez le code dans le formulaire
3. Cliquez sur "Vérifier"
4. Vérifiez que vous êtes redirigé vers la page de connexion

### 4. Test de la connexion
1. Entrez votre email: jean@example.com
2. Entrez votre mot de passe: password123
3. Cliquez sur "Se connecter"
4. Vérifiez que vous êtes redirigé vers le tableau de bord

### 5. Test du paiement
1. Dans le tableau de bord, entrez un montant: 50000
2. Sélectionnez une méthode de paiement: Carte bancaire
3. Cliquez sur "Payer maintenant"
4. Vérifiez que:
   - Un ID de transaction est généré
   - Un QR code est affiché
   - Le bouton "Télécharger le reçu" est disponible

### 6. Test du téléchargement du reçu
1. Cliquez sur "Télécharger le reçu"
2. Vérifiez que le reçu s'ouvre dans une nouvelle fenêtre

### 7. Test de la déconnexion
1. Cliquez sur "Déconnexion"
2. Vérifiez que vous êtes redirigé vers la page d'accueil

## Test avec curl

### Inscription
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jean",
    "last_name": "Dupont",
    "email": "jean@example.com",
    "phone": "+33612345678",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

Réponse attendue:
```json
{
  "message": "Registration successful. Check your email for verification code.",
  "candidate_id": 1
}
```

### Connexion
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@example.com",
    "password": "password123"
  }'
```

Réponse attendue:
```json
{
  "message": "Login successful",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "candidate": {
    "id": 1,
    "first_name": "Jean",
    "last_name": "Dupont",
    "email": "jean@example.com",
    "phone": "+33612345678",
    "email_verified": true
  }
}
```

### Initier un paiement
```bash
curl -X POST http://localhost:8000/api/payment/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "candidate_id": 1,
    "amount": 50000,
    "payment_method": "card"
  }'
```

Remplacez `TOKEN` par le token JWT obtenu lors de la connexion.

Réponse attendue:
```json
{
  "message": "Payment initiated",
  "payment": {
    "id": 1,
    "candidate_id": 1,
    "amount": "50000.00",
    "payment_method": "card",
    "status": "pending",
    "transaction_id": "TXN-ABC123XYZ789",
    "verification_link": "http://localhost:8000/api/payment/verify/TXN-ABC123XYZ789",
    "qr_code_path": "qr_codes/TXN-ABC123XYZ789.png"
  },
  "qr_code_url": "http://localhost:8000/storage/qr_codes/TXN-ABC123XYZ789.png"
}
```

## Vérification de la base de données

### Vérifier les candidats
```bash
mysql -u root -p candidats_app
SELECT * FROM candidates;
```

### Vérifier les paiements
```bash
SELECT * FROM payments;
```

### Vérifier les codes de vérification
```bash
SELECT * FROM verification_codes;
```

## Dépannage

### Erreur: "The database 'candidats_app' does not exist"
- Créez la base de données: `CREATE DATABASE candidats_app;`
- Exécutez les migrations: `php artisan migrate`

### Erreur: "CORS policy"
- Vérifiez que le frontend est sur le bon port (5173 ou 3000)
- Vérifiez la configuration CORS dans `Backend/config/cors.php`

### Erreur: "Email not verified"
- Vérifiez que vous avez entré le bon code de vérification
- Vérifiez que le code n'a pas expiré (15 minutes)

### Erreur: "Invalid credentials"
- Vérifiez que l'email et le mot de passe sont corrects
- Vérifiez que l'email a été vérifié

### Erreur: "Token expired"
- Reconnectez-vous pour obtenir un nouveau token

## Checklist de test

- [ ] Page d'accueil s'affiche correctement
- [ ] Inscription fonctionne
- [ ] Email de vérification est reçu
- [ ] Vérification d'email fonctionne
- [ ] Connexion fonctionne
- [ ] Tableau de bord s'affiche
- [ ] Paiement peut être initié
- [ ] QR code est généré
- [ ] Reçu peut être téléchargé
- [ ] Déconnexion fonctionne
- [ ] Redirection vers login fonctionne
- [ ] Validation des formulaires fonctionne
- [ ] Messages d'erreur s'affichent correctement
- [ ] Base de données est mise à jour correctement

## Performance

### Mesurer les temps de réponse
```bash
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8000/api/auth/login
```

### Vérifier les logs
```bash
tail -f Backend/storage/logs/laravel.log
```

## Sécurité

### Tester la validation
- Essayez d'envoyer des données invalides
- Essayez d'accéder à des endpoints protégés sans token
- Essayez d'utiliser un token expiré

### Tester les injections
- Essayez d'injecter du SQL dans les formulaires
- Essayez d'injecter du JavaScript dans les formulaires

## Prochains tests

- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Tests de charge
- [ ] Tests de sécurité
- [ ] Tests de compatibilité navigateur
