# Dépannage

## Problèmes courants et solutions

### Backend

#### 1. Erreur: "The database 'candidats_app' does not exist"

**Cause**: La base de données n'a pas été créée

**Solution**:
```bash
# Créer la base de données
mysql -u root -p
CREATE DATABASE candidats_app;
EXIT;

# Exécuter les migrations
php artisan migrate
```

#### 2. Erreur: "SQLSTATE[HY000]: General error: 1030 Got error"

**Cause**: Problème de connexion à la base de données

**Solution**:
```bash
# Vérifier que MySQL est en cours d'exécution
# Vérifier les paramètres de connexion dans .env
# Redémarrer MySQL
```

#### 3. Erreur: "Class 'Tymon\JWTAuth\Facades\JWTAuth' not found"

**Cause**: JWT Auth n'est pas installé ou configuré

**Solution**:
```bash
composer require tymon/jwt-auth
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
php artisan jwt:secret
```

#### 4. Erreur: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Cause**: CORS n'est pas configuré correctement

**Solution**:
```bash
# Vérifier Backend/config/cors.php
# Vérifier que le frontend est sur le bon port
# Redémarrer le serveur Laravel
php artisan serve
```

#### 5. Erreur: "The storage path does not exist"

**Cause**: Le lien de stockage n'a pas été créé

**Solution**:
```bash
php artisan storage:link
```

#### 6. Erreur: "Undefined variable: $table"

**Cause**: Erreur dans la migration

**Solution**:
```bash
# Vérifier la syntaxe de la migration
# Vérifier que la migration est correcte
php artisan migrate:rollback
php artisan migrate
```

#### 7. Erreur: "SMTP Error: Could not authenticate"

**Cause**: Paramètres SMTP incorrects

**Solution**:
```bash
# Vérifier les paramètres dans .env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre_email@gmail.com
MAIL_PASSWORD=votre_mot_de_passe_app

# Pour Gmail, utiliser un mot de passe d'application
# Voir: https://support.google.com/accounts/answer/185833
```

#### 8. Erreur: "The key is missing from your .env file"

**Cause**: APP_KEY n'est pas défini

**Solution**:
```bash
php artisan key:generate
```

#### 9. Erreur: "Route not found"

**Cause**: Les routes ne sont pas enregistrées

**Solution**:
```bash
# Vérifier Backend/routes/api.php
# Vérifier que les routes sont correctes
php artisan route:list
```

#### 10. Erreur: "Method not allowed"

**Cause**: La méthode HTTP n'est pas correcte

**Solution**:
```bash
# Vérifier que vous utilisez POST, GET, etc. correctement
# Vérifier Backend/routes/api.php
```

### Frontend

#### 1. Erreur: "Cannot find module 'react'"

**Cause**: Les dépendances ne sont pas installées

**Solution**:
```bash
cd Frontend
npm install
```

#### 2. Erreur: "VITE v5.0.0 ready in 123 ms"

**Cause**: Vite n'a pas démarré correctement

**Solution**:
```bash
# Vérifier que le port 5173 est disponible
# Vérifier que Node.js est installé
npm run dev
```

#### 3. Erreur: "Cannot GET /"

**Cause**: Le serveur Vite n'est pas en cours d'exécution

**Solution**:
```bash
cd Frontend
npm run dev
```

#### 4. Erreur: "Unexpected token '<'"

**Cause**: Erreur de syntaxe JSX

**Solution**:
```bash
# Vérifier la syntaxe du fichier
# Vérifier que le fichier a l'extension .jsx
```

#### 5. Erreur: "Cannot read property 'token' of undefined"

**Cause**: Le token n'est pas stocké correctement

**Solution**:
```bash
# Vérifier que localStorage fonctionne
# Vérifier que le token est retourné par l'API
```

#### 6. Erreur: "Axios is not defined"

**Cause**: Axios n'est pas importé

**Solution**:
```javascript
import axios from 'axios'
```

#### 7. Erreur: "React Router is not defined"

**Cause**: React Router n'est pas installé

**Solution**:
```bash
npm install react-router-dom
```

#### 8. Erreur: "Cannot read property 'map' of undefined"

**Cause**: Les données ne sont pas chargées

**Solution**:
```javascript
// Vérifier que les données sont définies
// Utiliser une valeur par défaut
const data = response.data || []
```

#### 9. Erreur: "Blank page"

**Cause**: Erreur JavaScript non gérée

**Solution**:
```bash
# Ouvrir la console du navigateur (F12)
# Vérifier les erreurs
# Vérifier que le backend est en cours d'exécution
```

#### 10. Erreur: "Cannot POST /api/auth/register"

**Cause**: Le backend n'est pas en cours d'exécution

**Solution**:
```bash
cd Backend
php artisan serve
```

### Base de données

#### 1. Erreur: "Access denied for user 'root'@'localhost'"

**Cause**: Mot de passe MySQL incorrect

**Solution**:
```bash
# Vérifier le mot de passe dans .env
# Réinitialiser le mot de passe MySQL
```

#### 2. Erreur: "Table 'candidats_app.candidates' doesn't exist"

**Cause**: Les migrations n'ont pas été exécutées

**Solution**:
```bash
php artisan migrate
```

#### 3. Erreur: "Duplicate entry for key 'email'"

**Cause**: L'email existe déjà

**Solution**:
```bash
# Utiliser un email différent
# Ou supprimer l'enregistrement existant
DELETE FROM candidates WHERE email = 'jean@example.com';
```

#### 4. Erreur: "Syntax error in SQL"

**Cause**: Erreur dans la migration

**Solution**:
```bash
# Vérifier la syntaxe de la migration
# Vérifier que les colonnes sont correctes
php artisan migrate:rollback
php artisan migrate
```

### Général

#### 1. Erreur: "Connection refused"

**Cause**: Le serveur n'est pas en cours d'exécution

**Solution**:
```bash
# Vérifier que le backend est en cours d'exécution
php artisan serve

# Vérifier que le frontend est en cours d'exécution
npm run dev

# Vérifier que MySQL est en cours d'exécution
```

#### 2. Erreur: "Port already in use"

**Cause**: Le port est déjà utilisé

**Solution**:
```bash
# Utiliser un port différent
php artisan serve --port=8001
npm run dev -- --port 3001

# Ou tuer le processus qui utilise le port
# Sur Windows: netstat -ano | findstr :8000
# Sur Linux: lsof -i :8000
```

#### 3. Erreur: "Permission denied"

**Cause**: Permissions insuffisantes

**Solution**:
```bash
# Sur Linux/Mac
chmod -R 755 Backend/storage
chmod -R 755 Backend/bootstrap/cache

# Sur Windows
# Vérifier les permissions du dossier
```

#### 4. Erreur: "File not found"

**Cause**: Le fichier n'existe pas

**Solution**:
```bash
# Vérifier que le fichier existe
# Vérifier le chemin du fichier
# Vérifier les permissions
```

#### 5. Erreur: "Timeout"

**Cause**: La requête prend trop de temps

**Solution**:
```bash
# Vérifier la performance du serveur
# Vérifier la connexion réseau
# Augmenter le timeout
```

## Logs

### Afficher les logs Laravel
```bash
tail -f Backend/storage/logs/laravel.log
```

### Afficher les logs du navigateur
```bash
# Ouvrir la console du navigateur (F12)
# Aller à l'onglet "Console"
```

### Afficher les logs MySQL
```bash
# Sur Linux
tail -f /var/log/mysql/error.log

# Sur Windows
# Vérifier l'Event Viewer
```

## Outils de débogage

### Postman
- Télécharger: https://www.postman.com/downloads/
- Utiliser pour tester les endpoints API

### VS Code
- Installer l'extension "REST Client"
- Créer un fichier `.http` pour tester les endpoints

### Laravel Debugbar
```bash
composer require barryvdh/laravel-debugbar --dev
```

### React DevTools
- Installer l'extension Chrome/Firefox
- Utiliser pour déboguer les composants React

## Ressources utiles

- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [JWT Auth Documentation](https://jwt-auth.readthedocs.io)
- [Axios Documentation](https://axios-http.com/)
- [Vite Documentation](https://vitejs.dev/)

## Contacter le support

Si vous avez des problèmes non résolus:
1. Vérifier les logs
2. Vérifier la documentation
3. Chercher sur Google
4. Demander de l'aide sur les forums
