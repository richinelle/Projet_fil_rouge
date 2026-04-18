# Structure du projet

## Vue d'ensemble

```
projet-fil/
├── Backend/                          # Application Laravel
│   ├── app/
│   │   ├── Models/
│   │   │   ├── Candidate.php        # Modèle candidat
│   │   │   ├── Payment.php          # Modèle paiement
│   │   │   └── VerificationCode.php # Modèle code de vérification
│   │   └── Http/
│   │       └── Controllers/
│   │           ├── AuthController.php      # Authentification
│   │           └── PaymentController.php   # Paiement
│   ├── database/
│   │   └── migrations/
│   │       ├── 2026_01_18_155909_create_candidates_table.php
│   │       ├── 2026_01_18_155920_create_payments_table.php
│   │       └── 2026_01_18_155921_create_verification_codes_table.php
│   ├── routes/
│   │   └── api.php                  # Routes API
│   ├── config/
│   │   ├── auth.php                 # Configuration authentification
│   │   ├── cors.php                 # Configuration CORS
│   │   └── jwt.php                  # Configuration JWT
│   ├── storage/
│   │   └── app/public/
│   │       └── qr_codes/            # QR codes générés
│   ├── .env                         # Variables d'environnement
│   ├── .env.example                 # Exemple de configuration
│   ├── composer.json                # Dépendances PHP
│   ├── artisan                      # CLI Laravel
│   └── API_DOCUMENTATION.md         # Documentation API
│
├── Frontend/                         # Application React
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Page d'accueil
│   │   │   ├── Register.jsx         # Inscription
│   │   │   ├── Login.jsx            # Connexion
│   │   │   ├── VerifyEmail.jsx      # Vérification email
│   │   │   └── Dashboard.jsx        # Tableau de bord
│   │   ├── api/
│   │   │   ├── client.js            # Client HTTP
│   │   │   ├── auth.js              # Services authentification
│   │   │   └── payment.js           # Services paiement
│   │   ├── styles/
│   │   │   ├── Home.css             # Styles accueil
│   │   │   ├── Auth.css             # Styles authentification
│   │   │   └── Dashboard.css        # Styles tableau de bord
│   │   ├── App.jsx                  # Composant principal
│   │   ├── main.jsx                 # Point d'entrée
│   │   └── index.css                # Styles globaux
│   ├── index.html                   # HTML principal
│   ├── vite.config.js               # Configuration Vite
│   ├── package.json                 # Dépendances Node
│   ├── .env                         # Variables d'environnement
│   ├── .env.example                 # Exemple de configuration
│   └── .gitignore                   # Fichiers à ignorer
│
├── Documentation/
│   ├── INDEX.md                     # Index de la documentation
│   ├── README.md                    # Vue d'ensemble
│   ├── SETUP.md                     # Guide d'installation
│   ├── COMMANDS.md                  # Commandes utiles
│   ├── TESTING.md                   # Guide de test
│   ├── TROUBLESHOOTING.md           # Dépannage
│   ├── BEST_PRACTICES.md            # Bonnes pratiques
│   ├── NEXT_STEPS.md                # Améliorations futures
│   ├── PROJECT_SUMMARY.md           # Résumé du projet
│   └── STRUCTURE.md                 # Ce fichier
│
└── .gitignore                       # Fichiers à ignorer globalement
```

## Détails des fichiers

### Backend

#### Modèles (app/Models/)
- **Candidate.php** - Gère les candidats avec relations
- **Payment.php** - Gère les paiements
- **VerificationCode.php** - Gère les codes de vérification

#### Contrôleurs (app/Http/Controllers/)
- **AuthController.php** - Gère l'authentification (register, login, verify)
- **PaymentController.php** - Gère les paiements et QR codes

#### Migrations (database/migrations/)
- **create_candidates_table** - Table des candidats
- **create_payments_table** - Table des paiements
- **create_verification_codes_table** - Table des codes de vérification

#### Configuration (config/)
- **auth.php** - Configuration JWT et providers
- **cors.php** - Configuration CORS
- **jwt.php** - Configuration JWT Auth

### Frontend

#### Pages (src/pages/)
- **Home.jsx** - Page d'accueil avec présentation
- **Register.jsx** - Formulaire d'inscription
- **Login.jsx** - Formulaire de connexion
- **VerifyEmail.jsx** - Vérification d'email
- **Dashboard.jsx** - Tableau de bord avec paiement

#### Services API (src/api/)
- **client.js** - Client HTTP avec intercepteurs
- **auth.js** - Services d'authentification
- **payment.js** - Services de paiement

#### Styles (src/styles/)
- **Home.css** - Styles de la page d'accueil
- **Auth.css** - Styles des formulaires d'authentification
- **Dashboard.css** - Styles du tableau de bord

### Documentation

- **INDEX.md** - Guide de navigation
- **README.md** - Vue d'ensemble du projet
- **SETUP.md** - Instructions d'installation
- **COMMANDS.md** - Commandes utiles
- **TESTING.md** - Guide de test
- **TROUBLESHOOTING.md** - Dépannage
- **BEST_PRACTICES.md** - Bonnes pratiques
- **NEXT_STEPS.md** - Améliorations futures
- **PROJECT_SUMMARY.md** - Résumé du projet

## Flux de données

```
Frontend (React)
    ↓
API Client (Axios)
    ↓
Backend API (Laravel)
    ↓
Contrôleurs
    ↓
Modèles
    ↓
Base de données (MySQL)
```

## Flux d'authentification

```
1. Inscription
   ├── Validation des données
   ├── Hachage du mot de passe
   ├── Création du candidat
   ├── Génération du code de vérification
   └── Envoi d'email

2. Vérification d'email
   ├── Validation du code
   ├── Marquage comme vérifié
   └── Suppression du code

3. Connexion
   ├── Validation des données
   ├── Vérification du mot de passe
   ├── Génération du token JWT
   └── Retour du token

4. Utilisation du token
   ├── Stockage dans localStorage
   ├── Envoi dans les headers
   └── Accès aux endpoints protégés
```

## Flux de paiement

```
1. Initiation
   ├── Validation des données
   ├── Création du paiement
   ├── Génération du QR code
   └── Retour des données

2. Vérification
   ├── Récupération du paiement
   └── Retour des informations

3. Complétion
   ├── Mise à jour du statut
   └── Confirmation

4. Reçu
   ├── Récupération du paiement
   ├── Récupération du QR code
   └── Affichage du reçu
```

## Dépendances principales

### Backend
- laravel/framework (12.47.0)
- tymon/jwt-auth (2.2.1)
- endroid/qr-code (6.1.0)
- symfony/mailer (7.4.3)

### Frontend
- react (18.2.0)
- react-dom (18.2.0)
- react-router-dom (6.20.0)
- axios (1.6.0)
- vite (5.0.8)

## Ports

- Backend: 8000
- Frontend: 5173 ou 3000
- MySQL: 3306

## Variables d'environnement

### Backend (.env)
```
APP_NAME=Laravel
APP_ENV=local
APP_DEBUG=true
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=candidats_app
DB_USERNAME=root
DB_PASSWORD=
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
JWT_SECRET=...
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
```

## Sécurité

- Hachage des mots de passe avec bcrypt
- Tokens JWT pour l'authentification
- CORS configuré
- Validation des données
- Codes de vérification avec expiration
- Stockage sécurisé des tokens

## Performance

- Lazy loading des composants React
- Mise en cache des requêtes
- Pagination des données
- Compression des images
- Optimisation des requêtes BD

## Scalabilité

- Architecture modulaire
- Séparation des responsabilités
- API RESTful
- Base de données normalisée
- Prêt pour les microservices

---

**Dernière mise à jour**: 18 janvier 2026
