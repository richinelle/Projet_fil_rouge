# Guide de démarrage

## Prérequis
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+

## Étape 1: Configuration du Backend

```bash
cd Backend

# Installer les dépendances
composer install

# Configurer l'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate

# Générer la clé JWT
php artisan jwt:secret

# Exécuter les migrations
php artisan migrate

# Créer le lien de stockage
php artisan storage:link

# Démarrer le serveur Laravel
php artisan serve
```

Le backend sera disponible sur `http://localhost:8000`

## Étape 2: Configuration du Frontend

```bash
cd Frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

Le frontend sera disponible sur `http://localhost:5173` ou `http://localhost:3000`

## Configuration de la base de données

Assurez-vous que MySQL est en cours d'exécution et créez une base de données:

```sql
CREATE DATABASE candidats_app;
```

Mettez à jour le fichier `.env` du Backend:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=candidats_app
DB_USERNAME=root
DB_PASSWORD=
```

## Configuration de l'email

Pour tester l'envoi d'emails, configurez les paramètres SMTP dans `.env`:

```
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre_email@gmail.com
MAIL_PASSWORD=votre_mot_de_passe_app
```

**Note**: Pour Gmail, utilisez un mot de passe d'application généré depuis les paramètres de sécurité.

## Test de l'application

1. Ouvrez `http://localhost:5173` dans votre navigateur
2. Cliquez sur "S'inscrire"
3. Remplissez le formulaire d'inscription
4. Vérifiez votre email et entrez le code de vérification
5. Connectez-vous avec vos identifiants
6. Effectuez un paiement de test
7. Téléchargez votre reçu avec le QR code

## Dépannage

### Erreur de connexion à la base de données
- Vérifiez que MySQL est en cours d'exécution
- Vérifiez les paramètres de connexion dans `.env`
- Assurez-vous que la base de données existe

### Erreur CORS
- Vérifiez que le frontend et le backend sont sur les bons ports
- Vérifiez la configuration CORS dans `Backend/config/cors.php`

### Erreur d'envoi d'email
- Vérifiez les paramètres SMTP dans `.env`
- Vérifiez que le mot de passe d'application est correct
- Vérifiez les logs: `tail -f Backend/storage/logs/laravel.log`

## Structure du projet

```
.
├── Backend/                 # Application Laravel
│   ├── app/
│   │   ├── Models/         # Modèles Eloquent
│   │   └── Http/
│   │       └── Controllers/ # Contrôleurs API
│   ├── database/
│   │   └── migrations/     # Migrations de base de données
│   ├── routes/
│   │   └── api.php         # Routes API
│   └── config/             # Fichiers de configuration
├── Frontend/               # Application React
│   ├── src/
│   │   ├── pages/          # Pages React
│   │   ├── api/            # Services API
│   │   └── styles/         # Fichiers CSS
│   └── package.json
└── README.md
```

## Prochaines étapes

1. Intégrer les passerelles de paiement réelles (OM, MTN Money, Stripe)
2. Ajouter un système d'administration
3. Implémenter les notifications en temps réel
4. Ajouter des tests unitaires et d'intégration
5. Déployer sur un serveur de production
