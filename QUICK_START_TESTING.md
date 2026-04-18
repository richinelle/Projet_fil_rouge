# Quick Start Testing Guide

## Prerequisites
- PHP 8.2+
- Node.js 18+
- MySQL running
- Database `appli_fil` created

## Step 1: Start Backend
```bash
cd Backend
php artisan serve
```
Backend will run on `http://localhost:8000`

## Step 2: Start Frontend
```bash
cd Frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

---

## Testing Scenarios

### Scenario 1: Candidate Registration & Login

1. **Navigate to Home**
   - Go to http://localhost:5173
   - Click "S'inscrire (Candidat)"

2. **Register**
   - Fill in all fields:
     - First Name: John
     - Last Name: Doe
     - Email: john@example.com
     - Phone: +1234567890
     - Password: password123
   - Click "S'inscrire"

3. **Verify Email**
   - Check your email (richinellelaurence@gmail.com receives test emails)
   - Copy the verification code
   - Enter code on verification page
   - Click "Vérifier"

4. **Login**
   - Go to http://localhost:5173/login
   - Enter: john@example.com / password123
   - Click "Se connecter"

5. **Expected Result**
   - Redirected to Dashboard
   - Navbar shows candidate name
   - Can see enrollment progress

---

### Scenario 2: Complete Enrollment

1. **After Login**
   - Dashboard shows "Complétez votre inscription"
   - Click "Commencer l'inscription"

2. **Fill Enrollment Steps**
   - Step 1: Personal Information
   - Step 2: Education
   - Step 3: Experience
   - Step 4: Emergency Contact
   - Step 5: Additional Info
   - Step 6: Review
   - Step 7: Submit

3. **Expected Result**
   - Progress bar updates
   - Can save at any step
   - Final submission completes enrollment

---

### Scenario 3: View & Register for Contests

1. **View Contests**
   - Click "Concours" in navbar
   - See list of available contests
   - Click contest to see details

2. **Register for Contest**
   - Click "S'inscrire" button
   - Confirm registration

3. **Expected Result**
   - Contest appears in "Mes Concours"
   - Can view registration status

---

### Scenario 4: Make Payment

1. **From Dashboard**
   - Click "Effectuer un paiement"
   - Select payment method:
     - Carte Bancaire
     - OM
     - MTN Money

2. **Complete Payment**
   - Enter amount
   - Confirm payment

3. **Expected Result**
   - QR code generated
   - Receipt downloadable
   - Payment recorded in database

---

### Scenario 5: Manager Login & Create Contest

1. **Navigate to Admin Login**
   - Go to http://localhost:5173
   - Click "Connexion Admin/Manager"

2. **Login as Manager**
   - Email: manager@example.com
   - Password: manager123
   - Click "Se connecter"

3. **Create Contest**
   - Click "+ Créer un concours"
   - Fill form:
     - Title: "Programming Challenge 2026"
     - Description: "Test your coding skills"
     - Registration Fee: 50
     - Registration Start: 2026-01-20 10:00
     - Registration End: 2026-02-20 10:00
     - Contest Date: 2026-03-01 14:00
     - Location: "Online"
     - Max Participants: 100
   - Click "Créer le concours"

4. **Expected Result**
   - Contest appears in list
   - Can see participant count
   - Can view participants

---

### Scenario 6: Admin Login

1. **Navigate to Admin Login**
   - Go to http://localhost:5173
   - Click "Connexion Admin/Manager"

2. **Login as Admin**
   - Email: admin@example.com
   - Password: admin123
   - Click "Se connecter"

3. **Expected Result**
   - Redirected to Admin Dashboard
   - Can see admin-specific features

---

## Troubleshooting

### Backend Issues

**Error: "SQLSTATE[HY000]: General error: 1030"**
- Solution: Check MySQL is running
- Run: `php artisan migrate:fresh --seed`

**Error: "Class not found"**
- Solution: Run `composer install`
- Then: `php artisan cache:clear`

**Error: "JWT token not found"**
- Solution: Check JWT_SECRET in .env
- Verify token is being sent in Authorization header

### Frontend Issues

**Error: "Cannot find module '@vitejs/plugin-react'"**
- Solution: Run `npm install` in Frontend folder

**Error: "CORS error"**
- Solution: Backend CORS is configured for localhost:5173
- Verify backend is running on port 8000

**Error: "API not responding"**
- Solution: Check backend is running
- Verify API_URL in `Frontend/src/api/client.js`

### Email Issues

**Verification code not received**
- Check spam folder
- Verify MAIL_USERNAME and MAIL_PASSWORD in .env
- Check Laravel logs: `Backend/storage/logs/laravel.log`

---

## Database Reset

If you need to reset everything:

```bash
cd Backend

# Drop and recreate database
php artisan migrate:fresh --seed

# This will:
# - Drop all tables
# - Run all migrations
# - Seed admin and manager users
```

---

## Key Files to Monitor

### Backend Logs
```
Backend/storage/logs/laravel.log
```

### Frontend Console
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for API calls

### Database
- Use MySQL client or phpMyAdmin
- Database: `appli_fil`
- Check tables for data

---

## Common Test Data

### Candidate Registration
```
First Name: Test
Last Name: User
Email: test@example.com
Phone: +1234567890
Password: Test@1234
```

### Manager Contest
```
Title: Test Contest
Description: This is a test contest
Fee: 100
Max Participants: 50
Location: Test Location
```

---

## Performance Tips

1. **Clear Cache**
   ```bash
   php artisan cache:clear
   php artisan config:clear
   ```

2. **Optimize Database**
   ```bash
   php artisan optimize
   ```

3. **Check Logs**
   ```bash
   tail -f Backend/storage/logs/laravel.log
   ```

---

**Last Updated**: January 18, 2026
