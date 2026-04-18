# Quick Test Guide - Phase 1 Complete Features

## Admin Access

### Login Credentials
- **Email**: admin@example.com
- **Password**: admin123

### Manager Credentials
- **Email**: manager@example.com
- **Password**: manager123

## Testing Admin Features

### 1. User Management
1. Go to `/admin/dashboard`
2. Click "👥 Gestion des Utilisateurs"
3. Test the following:
   - **Users Tab**: View all admin/manager users
   - **Create User**: Add new admin or manager
   - **Toggle Status**: Activate/deactivate users
   - **Delete User**: Remove users
   - **Candidates Tab**: View all registered candidates
   - **Statistics Tab**: View system statistics
   - **Activity Tab**: View user activity log

### 2. Department Management
1. From Admin Dashboard, click "🏢 Gestion des Départements"
2. Test the following:
   - **Create Department**: Add new department with name, code, head info
   - **View Departments**: See all departments in grid layout
   - **Edit Department**: Update department information
   - **Delete Department**: Remove departments
   - **Search**: Filter departments by name

### 3. Filière Management
1. From Admin Dashboard, click "📚 Gestion des Filières"
2. Test the following:
   - **Create Filière**: Add new filière with department link
   - **View Filières**: See all filières in grid layout
   - **Edit Filière**: Update filière information
   - **Delete Filière**: Remove filières
   - **Department Link**: Verify filière-department relationships

## Testing Candidate Features (Already Implemented)

### 1. Registration & Login
1. Go to `/register`
2. Fill in candidate information
3. Verify email via code sent to Gmail
4. Login with credentials

### 2. Contest Registration
1. Go to `/contests`
2. View all available contests
3. Click "Voir les détails" on a contest
4. Click "S'inscrire" to register
5. Complete payment inline with QR code

### 3. Enrollment
1. Go to `/enrollment`
2. Complete 7-step enrollment form
3. Save progress at each step
4. Submit final enrollment

## API Testing with Postman

### Admin Endpoints to Test

#### User Management
```
GET    http://localhost:8000/api/admin/users
POST   http://localhost:8000/api/admin/users
PUT    http://localhost:8000/api/admin/users/{id}
DELETE http://localhost:8000/api/admin/users/{id}
```

#### Department Management
```
GET    http://localhost:8000/api/admin/departments
POST   http://localhost:8000/api/admin/departments
PUT    http://localhost:8000/api/admin/departments/{id}
DELETE http://localhost:8000/api/admin/departments/{id}
```

#### Filière Management
```
GET    http://localhost:8000/api/admin/filieres
POST   http://localhost:8000/api/admin/filieres
PUT    http://localhost:8000/api/admin/filieres/{id}
DELETE http://localhost:8000/api/admin/filieres/{id}
```

### Headers Required
```
Authorization: Bearer {token}
Content-Type: application/json
```

## Sample Test Data

### Create Department
```json
{
  "name": "Informatique",
  "code": "INFO",
  "description": "Département d'Informatique",
  "head_name": "Dr. Jean Dupont",
  "head_email": "jean.dupont@example.com",
  "head_phone": "+237 6XX XXX XXX"
}
```

### Create Filière
```json
{
  "name": "Génie Logiciel",
  "code": "GL",
  "department_id": 1,
  "description": "Formation en développement logiciel",
  "duration_years": 3
}
```

### Create User
```json
{
  "name": "Manager Test",
  "email": "manager.test@example.com",
  "password": "password123",
  "role": "contest_manager",
  "phone": "+237 6XX XXX XXX",
  "organization": "Test Organization"
}
```

## Common Issues & Solutions

### Issue: "Unauthenticated" error
**Solution**: Ensure you're using the correct token and guard
- Admin/Manager: Use token from `/api/admin/login`
- Candidates: Use token from `/api/auth/login`

### Issue: Department/Filière not appearing
**Solution**: 
1. Verify migrations ran: `php artisan migrate`
2. Check database tables exist
3. Verify admin middleware is registered

### Issue: CORS errors
**Solution**: Ensure frontend URL is in CORS config
- Check `Backend/config/cors.php`
- Should include `localhost:5173` and `localhost:3000`

### Issue: Email verification not working
**Solution**: 
1. Check Gmail credentials in `.env`
2. Verify app password is correct
3. Check spam folder for verification email

## Performance Testing

### Load Testing Endpoints
1. Test with multiple concurrent requests
2. Monitor database query performance
3. Check response times for large datasets
4. Verify pagination works correctly

### Database Optimization
- Verify indexes are created
- Check query performance with EXPLAIN
- Monitor slow query log

## Security Testing

### Test Access Control
1. Try accessing admin endpoints as candidate (should fail)
2. Try accessing candidate endpoints as admin (should work)
3. Try accessing endpoints without token (should fail)
4. Try accessing with invalid token (should fail)

### Test Input Validation
1. Try creating user with invalid email
2. Try creating department with empty name
3. Try creating filière without department
4. Verify error messages are appropriate

## Browser Testing

### Responsive Design
- Test on desktop (1920x1080)
- Test on tablet (768x1024)
- Test on mobile (375x667)
- Verify all forms are usable

### Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Final Checklist

- [ ] Admin can create/edit/delete users
- [ ] Admin can create/edit/delete departments
- [ ] Admin can create/edit/delete filières
- [ ] Candidates can register and login
- [ ] Candidates can register for contests
- [ ] Candidates can complete enrollment
- [ ] Payments work with QR codes
- [ ] All currency displays show FCFA
- [ ] Role-based access control works
- [ ] Email verification works
- [ ] Activity logging works
- [ ] Statistics display correctly
- [ ] No console errors
- [ ] No database errors
- [ ] All API endpoints respond correctly

## Next Steps After Testing

1. **Bug Fixes**: Address any issues found during testing
2. **Performance Optimization**: Optimize slow queries/endpoints
3. **Phase 2 Development**: Start PDF generation and email notifications
4. **User Acceptance Testing**: Get feedback from stakeholders
5. **Production Deployment**: Deploy to production environment

---

**Happy Testing!** 🚀
