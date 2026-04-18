# Swagger API Documentation - Setup Complete

## Overview
Votre API SGEE est maintenant documentée avec Swagger/OpenAPI 3.0.

## Files Created

### 1. **Backend/app/Http/Controllers/SwaggerController.php**
- Contrôleur pour servir l'interface Swagger UI
- Méthode `ui()` : Affiche la page Swagger UI
- Méthode `json()` : Retourne le fichier swagger.json

### 2. **Backend/resources/views/swagger/ui.blade.php**
- Vue Blade pour l'interface Swagger UI
- Utilise Swagger UI CDN (v4.15.5)
- Charge la documentation depuis `/api/docs/json`

### 3. **Backend/storage/api-docs/swagger.json**
- Spécification OpenAPI 3.0 complète
- Docummente tous les endpoints principaux
- Inclut les schémas pour les modèles (Enrollment, Candidate, User, Contest, etc.)

### 4. **Backend/routes/api.php** (Updated)
- Route GET `/docs` → Affiche l'interface Swagger UI
- Route GET `/docs/json` → Retourne la spécification JSON

## How to Access

### Local Development
```
http://localhost:8000/api/docs
```

### API Specification
```
http://localhost:8000/api/docs/json
```

## Endpoints Documented

### Candidate Authentication
- `POST /auth/register` - Register new candidate
- `POST /auth/login` - Login candidate
- `POST /auth/verify-email` - Verify email
- `POST /auth/logout` - Logout
- `PUT /auth/profile` - Update profile
- `PUT /auth/password` - Change password

### Admin/Manager Authentication
- `POST /login` - Login admin/manager
- `POST /logout` - Logout
- `GET /profile` - Get profile
- `PUT /profile` - Update profile
- `POST /change-password` - Change password

### Enrollment Management
- `GET /enrollment/status` - Get enrollment status
- `POST /enrollment/save` - Create/update enrollment
- `POST /enrollment/submit` - Submit enrollment
- `GET /enrollment/certificate` - Download certificate

### Admin Enrollment Management
- `GET /admin/enrollments` - List enrollments (paginated)
- `POST /admin/enrollments/{id}/approve` - Approve enrollment
- `POST /admin/enrollments/{id}/reject` - Reject enrollment

### Contests
- `GET /contests` - List all contests
- `GET /contests/{id}` - Get contest details

### Departments & Filieres
- `GET /departments` - List departments
- `GET /filieres/by-department/{id}` - Get filieres by department

## Security
- All protected endpoints use Bearer JWT authentication
- Security scheme defined: `bearerAuth`
- Token format: `Authorization: Bearer <token>`

## Testing the API

### 1. Start your Laravel server
```bash
cd Backend
php artisan serve
```

### 2. Open Swagger UI
```
http://localhost:8000/api/docs
```

### 3. Authenticate
- Click "Authorize" button
- Enter your JWT token from login response
- All subsequent requests will include the token

## Next Steps

1. **Add more endpoints** to swagger.json as you develop new features
2. **Update schemas** when your models change
3. **Test endpoints** directly from Swagger UI
4. **Export documentation** for team sharing

## Notes

- The Swagger UI is read-only (no actual API calls are made)
- To test endpoints, use the "Try it out" feature in Swagger UI
- All responses are documented with example schemas
- Pagination metadata is included for list endpoints

## Support Contact
Email: richinellelaurence@gmail.com
Phone: +237 696482594
