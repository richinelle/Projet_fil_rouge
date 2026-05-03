# Documentation API

## Base URL
```
http://localhost:8000/api
```

## Authentification
Les endpoints protégés nécessitent un token JWT dans le header:
```
Authorization: Bearer {token}
```

## Endpoints

### Authentification

#### 1. Inscription
```
POST /auth/register
Content-Type: application/json

{
  "first_name": "Jean",
  "last_name": "Dupont",
  "email": "jean@example.com",
  "phone": "+33612345678",
  "password": "password123",
  "password_confirmation": "password123"
}

Response (201):
{
  "message": "Registration successful. Check your email for verification code.",
  "candidate_id": 1
}
```

#### 2. Connexion
```
POST /auth/login
Content-Type: application/json

{
  "email": "jean@example.com",
  "password": "password123"
}

Response (200):
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

#### 3. Vérification d'email
```
POST /auth/verify-email
Content-Type: application/json

{
  "candidate_id": 1,
  "code": "ABC123"
}

Response (200):
{
  "message": "Email verified successfully"
}
```

#### 4. Déconnexion
```
POST /auth/logout
Authorization: Bearer {token}

Response (200):
{
  "message": "Logout successful"
}
```

### Paiement

#### 1. Initier un paiement
```
POST /payment/initiate
Authorization: Bearer {token}
Content-Type: application/json

{
  "candidate_id": 1,
  "amount": 50000,
  "payment_method": "card"
}

Response (200):
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

#### 2. Vérifier un paiement
```
GET /payment/verify/{transactionId}

Response (200):
{
  "payment": {
    "id": 1,
    "candidate_id": 1,
    "amount": "50000.00",
    "payment_method": "card",
    "status": "pending",
    "transaction_id": "TXN-ABC123XYZ789"
  },
  "candidate": {
    "id": 1,
    "first_name": "Jean",
    "last_name": "Dupont",
    "email": "jean@example.com"
  }
}
```

#### 3. Compléter un paiement
```
POST /payment/complete
Content-Type: application/json

{
  "transaction_id": "TXN-ABC123XYZ789"
}

Response (200):
{
  "message": "Payment completed successfully",
  "payment": {
    "id": 1,
    "candidate_id": 1,
    "amount": "50000.00",
    "payment_method": "card",
    "status": "completed",
    "transaction_id": "TXN-ABC123XYZ789"
  }
}
```

#### 4. Obtenir le reçu
```
GET /payment/receipt/{transactionId}
Authorization: Bearer {token}

Response (200):
{
  "payment": {
    "id": 1,
    "candidate_id": 1,
    "amount": "50000.00",
    "payment_method": "card",
    "status": "completed",
    "transaction_id": "TXN-ABC123XYZ789",
    "created_at": "2026-01-18T15:59:09.000000Z"
  },
  "qr_code_url": "http://localhost:8000/storage/qr_codes/TXN-ABC123XYZ789.png"
}
```

## Codes d'erreur

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Données invalides |
| 401 | Unauthorized | Token manquant ou invalide |
| 403 | Forbidden | Email non vérifié |
| 404 | Not Found | Ressource non trouvée |
| 422 | Unprocessable Entity | Validation échouée |
| 500 | Internal Server Error | Erreur serveur |

## Méthodes de paiement supportées

- `card` - Carte bancaire
- `om` - Orange Money
- `mtn_money` - MTN Money

## Notes

- Les codes de vérification expirent après 15 minutes
- Les tokens JWT expirent après 1 heure
- Les montants sont en devise locale (à adapter selon votre région)
- Les QR codes contiennent le lien de vérification du paiement
