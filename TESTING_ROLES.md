# Testing Role-Based Access - Quick Guide

## Login Flows

### 1. Admin Login
```
URL: http://localhost:5173/admin-login
Email: admin@example.com
Password: admin123
Expected Redirect: /admin/dashboard
```

**Admin Dashboard Features**:
- 👥 User Management (only option)
  - View all users (admins, managers)
  - Create new users
  - Manage candidates
  - View statistics
  - View activity log

### 2. Department Head Login
```
URL: http://localhost:5173/admin-login
Email: head@example.com
Password: head123
Expected Redirect: /department-head/dashboard
```

**Department Head Dashboard Features**:
- 🏢 Department Management
  - Create/edit/delete departments
  - Manage department information
  - View department statistics
  
- 📚 Filière Management
  - Create/edit/delete filières
  - Link filières to departments
  - View filière statistics

### 3. Manager Login
```
URL: http://localhost:5173/admin-login
Email: manager@example.com
Password: manager123
Expected Redirect: /manager/dashboard
```

**Manager Dashboard Features**:
- Create and manage contests
- View contest participants
- Update participant status

### 4. Candidate Login
```
URL: http://localhost:5173/login
Email: (any registered candidate)
Password: (candidate password)
Expected Redirect: /dashboard
```

**Candidate Dashboard Features**:
- View contests
- Register for contests
- Complete enrollment
- Make payments

## API Testing with Postman

### Admin Endpoints

**Create User**
```
POST http://localhost:8000/api/admin/users
Headers: Authorization: Bearer {admin_token}
Body: {
  "name": "New Manager",
  "email": "newmanager@example.com",
  "password": "password123",
  "role": "contest_manager",
  "phone": "+237 6XX XXX XXX",
  "organization": "Test Org"
}
```

**List Users**
```
GET http://localhost:8000/api/admin/users
Headers: Authorization: Bearer {admin_token}
```

**List Candidates**
```
GET http://localhost:8000/api/admin/candidates
Headers: Authorization: Bearer {admin_token}
```

### Department Head Endpoints

**Create Department**
```
POST http://localhost:8000/api/department-head/departments
Headers: Authorization: Bearer {head_token}
Body: {
  "name": "Informatique",
  "code": "INFO",
  "description": "Département d'Informatique",
  "head_name": "Dr. Jean Dupont",
  "head_email": "jean@example.com",
  "head_phone": "+237 6XX XXX XXX"
}
```

**Create Filière**
```
POST http://localhost:8000/api/department-head/filieres
Headers: Authorization: Bearer {head_token}
Body: {
  "name": "Génie Logiciel",
  "code": "GL",
  "department_id": 1,
  "description": "Formation en développement logiciel",
  "duration_years": 3
}
```

**List Departments**
```
GET http://localhost:8000/api/department-head/departments
Headers: Authorization: Bearer {head_token}
```

**List Filières**
```
GET http://localhost:8000/api/department-head/filieres
Headers: Authorization: Bearer {head_token}
```

## Access Control Testing

### Test 1: Admin Cannot Access Department Head Features
```
1. Login as admin@example.com
2. Try to access /department-head/dashboard
3. Expected: Redirect to /admin/dashboard (or error)
```

### Test 2: Department Head Cannot Access Admin Features
```
1. Login as head@example.com
2. Try to access /admin/users
3. Expected: Redirect to /department-head/dashboard (or error)
```

### Test 3: Unauthorized API Access
```
1. Get admin token from admin login
2. Try to call: GET /api/department-head/departments
3. Expected: 403 Forbidden error
```

### Test 4: Department Head API Access
```
1. Get department head token from head login
2. Call: GET /api/department-head/departments
3. Expected: 200 OK with departments list
```

## Frontend Navigation Testing

### Admin Dashboard
- [ ] Can see "Gestion des Utilisateurs" button
- [ ] Cannot see "Gestion des Départements" button
- [ ] Cannot see "Gestion des Filières" button
- [ ] Clicking user management goes to /admin/users

### Department Head Dashboard
- [ ] Can see "Gestion des Départements" button
- [ ] Can see "Gestion des Filières" button
- [ ] Cannot see "Gestion des Utilisateurs" button
- [ ] Clicking departments goes to /department-head/departments
- [ ] Clicking filières goes to /department-head/filieres

### User Management Page (Admin Only)
- [ ] Can create new users
- [ ] Can select role (admin or contest_manager)
- [ ] Can view candidates
- [ ] Can view statistics
- [ ] Can view activity log

### Department Management Page (Head Only)
- [ ] Can create new departments
- [ ] Can edit departments
- [ ] Can delete departments
- [ ] Can view department cards

### Filière Management Page (Head Only)
- [ ] Can create new filières
- [ ] Can select department
- [ ] Can edit filières
- [ ] Can delete filières
- [ ] Can view filière cards

## Error Scenarios to Test

### Scenario 1: Invalid Credentials
```
Email: admin@example.com
Password: wrongpassword
Expected: "Invalid credentials" error message
```

### Scenario 2: Inactive User
```
1. Create a user and set is_active = false
2. Try to login
Expected: "Account is inactive" error message
```

### Scenario 3: Missing Required Fields
```
POST /api/admin/users
Body: { "name": "Test" }  // Missing email, password, role
Expected: Validation error
```

### Scenario 4: Duplicate Email
```
1. Create user with email: test@example.com
2. Try to create another user with same email
Expected: Validation error or duplicate error
```

## Performance Testing

### Load Test Department Creation
```
1. Create 100 departments rapidly
2. Monitor response times
3. Expected: All requests complete successfully
```

### Load Test Filière Creation
```
1. Create 100 filières rapidly
2. Monitor response times
3. Expected: All requests complete successfully
```

## Data Validation Testing

### Department Creation
- [ ] Name is required
- [ ] Code is required
- [ ] Code must be unique
- [ ] Description is optional
- [ ] Head info is optional

### Filière Creation
- [ ] Name is required
- [ ] Code is required
- [ ] Department is required
- [ ] Duration must be 1-10 years
- [ ] Description is optional

### User Creation
- [ ] Name is required
- [ ] Email is required and valid
- [ ] Email must be unique
- [ ] Password is required (min 8 chars)
- [ ] Role is required
- [ ] Phone is optional
- [ ] Organization is optional

## Cleanup Testing

### Delete Department
```
1. Create a department
2. Delete it
3. Expected: Department removed from list
```

### Delete Filière
```
1. Create a filière
2. Delete it
3. Expected: Filière removed from list
```

### Delete User
```
1. Create a user
2. Delete it
3. Expected: User removed from list
```

## Final Verification Checklist

- [ ] All 4 roles can login successfully
- [ ] Each role redirects to correct dashboard
- [ ] Admin can only manage users
- [ ] Department head can only manage departments/filières
- [ ] Manager can only manage contests
- [ ] Candidates can register and enroll
- [ ] All API endpoints return correct data
- [ ] Middleware properly restricts access
- [ ] No console errors in browser
- [ ] No database errors in logs
- [ ] All forms validate input correctly
- [ ] All CRUD operations work
- [ ] Logout works for all roles
- [ ] Session persists after page refresh
- [ ] Token expires appropriately

---

**Ready to Test!** 🚀
