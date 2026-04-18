# Plateforme de Candidature avec Paiement

Une application complète pour la gestion des candidatures avec système de paiement intégré, génération de QR codes et vérification par email.

## Architecture

### Backend (Laravel)
- API REST avec authentification JWT
- Gestion des candidats
- Système de paiement (OM, MTN Money, Carte bancaire)
- Génération de QR codes
- Envoi d'emails de vérification

### Frontend (React)
- Page d'accueil
- Inscription et connexion
- Vérification d'email
- Tableau de bord candidat
- Système de paiement
- Téléchargement de reçus

## Installation

### Backend

```bash
cd Backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate
php artisan serve
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

## Configuration

### Base de données
Assurez-vous que MySQL est en cours d'exécution et configurez les paramètres dans `.env`:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=candidats_app
DB_USERNAME=root
DB_PASSWORD=
```

### Email
Configurez vos paramètres SMTP dans `.env`:

```
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre_email@gmail.com
MAIL_PASSWORD=votre_mot_de_passe
```

## Endpoints API

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/verify-email` - Vérification d'email
- `POST /api/auth/logout` - Déconnexion

### Paiement
- `POST /api/payment/initiate` - Initier un paiement
- `GET /api/payment/verify/{transactionId}` - Vérifier un paiement
- `POST /api/payment/complete` - Compléter un paiement
- `GET /api/payment/receipt/{transactionId}` - Obtenir le reçu

## Flux utilisateur

1. L'utilisateur s'inscrit sur la page d'inscription
2. Un code de vérification est envoyé par email
3. L'utilisateur vérifie son email avec le code
4. L'utilisateur se connecte
5. Dans le tableau de bord, l'utilisateur effectue un paiement
6. Un QR code est généré et affiché
7. L'utilisateur peut télécharger son reçu avec le QR code

## Technologies utilisées

### Backend
- Laravel 12
- JWT Auth
- Endroid QR Code
- Symfony Mailer

### Frontend
- React 18
- React Router
- Axios
- Vite

## Licence

MIT
