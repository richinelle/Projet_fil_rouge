# Testing Guide - Payment Mandatory System

## Prerequisites
- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:5173`
- Database seeded with test data
- Test candidate account created

## Test Candidate Credentials
```
Email: candidate@example.com
Password: password123
```

## Test Contests
Ensure at least 2 contests exist in database with:
- Title: "Concours Test 1", "Concours Test 2"
- Registration fee: 50000 FCFA, 75000 FCFA
- Status: active
- Contest date: future date

## Test Cases

### TC1: Payment Flow - Happy Path
**Objective:** Complete full payment and enrollment flow

**Steps:**
1. Login with candidate credentials
2. Click "Payer un concours" on dashboard
3. Verify contests list displays
4. Select first contest
5. Verify payment card appears
6. Select "Carte Bancaire" payment method
7. Click "✓ Effectuer le paiement"
8. Verify success message appears
9. Verify "✓ Payé" badge appears on contest
10. Verify "➜ Continuer l'inscription" button appears

**Expected Results:**
- ✓ Payment processed successfully
- ✓ QR code generated
- ✓ Contest registration created
- ✓ Candidate can proceed to enrollment

---

### TC2: Enrollment with Payment Validation
**Objective:** Verify payment is required for enrollment submission

**Steps:**
1. Complete TC1 (payment)
2. Click "➜ Continuer l'inscription"
3. Fill all 6 enrollment steps with valid data
4. Reach step 7 (Documents)
5. Verify payment requirement notice displays
6. Upload all required documents:
   - Relevé du Bac
   - Acte de Naissance
   - CNI Valide
   - 4 Photos 4x4
7. Select contest for payment receipt
8. Upload payment receipt
9. Click "✓ Soumettre"

**Expected Results:**
- ✓ All documents uploaded successfully
- ✓ Payment receipt linked to contest
- ✓ Enrollment submitted successfully
- ✓ Redirected to dashboard
- ✓ Status shows "Inscription soumise"

---

### TC3: Payment Rejection - Missing Payment
**Objective:** Verify enrollment cannot be submitted without payment

**Steps:**
1. Login with candidate credentials
2. Navigate to `/enrollment` directly (bypass payment)
3. Fill all 6 enrollment steps
4. Reach step 7 (Documents)
5. Upload all required documents EXCEPT payment receipt
6. Click "✓ Soumettre"

**Expected Results:**
- ✗ Error: "Missing required documents"
- ✗ Lists missing: payment_receipt
- ✗ Enrollment not submitted

---

### TC4: Payment Rejection - No Completed Payment
**Objective:** Verify enrollment cannot be submitted without completed payment

**Steps:**
1. Login with candidate credentials
2. Navigate to `/enrollment` directly
3. Fill all 6 enrollment steps
4. Reach step 7 (Documents)
5. Upload all required documents including payment receipt
6. BUT do NOT complete payment (simulate)
7. Click "✓ Soumettre"

**Expected Results:**
- ✗ Error: "Payment must be completed for the selected contest before submission"
- ✗ Confirmation dialog appears
- ✗ Option to go to payment page
- ✗ Enrollment not submitted

---

### TC5: Multiple Payment Methods
**Objective:** Verify all payment methods work

**Steps:**
1. Login with candidate credentials
2. Click "Payer un concours"
3. Select first contest
4. Select "Orange Money" payment method
5. Click "✓ Effectuer le paiement"
6. Verify payment succeeds
7. Repeat with "MTN Money" for second contest

**Expected Results:**
- ✓ All payment methods process successfully
- ✓ QR codes generated for each
- ✓ Both contests marked as paid

---

### TC6: Document Upload Validation
**Objective:** Verify document validation rules

**Steps:**
1. Complete payment (TC1)
2. Click "➜ Continuer l'inscription"
3. Fill steps 1-6
4. Reach step 7 (Documents)

**Test 6a: Invalid File Type**
- Try uploading .txt file
- Expected: Error "Type de fichier non autorisé"

**Test 6b: File Too Large**
- Try uploading file > 2MB
- Expected: Error "Le fichier dépasse la taille maximale de 2MB"

**Test 6c: Valid File**
- Upload PNG/JPG/PDF file < 2MB
- Expected: Success, checkmark appears

---

### TC7: Dashboard Document Display
**Objective:** Verify documents display on dashboard

**Steps:**
1. Complete full enrollment (TC2)
2. Navigate to dashboard
3. Scroll to "Mes Documents" section
4. Verify all uploaded documents listed
5. Click download button for each document

**Expected Results:**
- ✓ All documents displayed with correct names
- ✓ File sizes shown
- ✓ Download buttons functional
- ✓ Files download correctly

---

### TC8: Payment Status Check
**Objective:** Verify payment status endpoint works

**Steps:**
1. Complete payment (TC1)
2. Open browser console
3. Run: `fetch('http://localhost:8000/api/payment/check/1', {headers: {'Authorization': 'Bearer TOKEN'}})`
4. Verify response

**Expected Results:**
- ✓ Response: `{"has_paid": true, "payment": {...}}`
- ✓ Payment details included

---

### TC9: Mobile Responsiveness
**Objective:** Verify UI works on mobile devices

**Steps:**
1. Open DevTools (F12)
2. Toggle device toolbar (mobile view)
3. Test at 375px width (iPhone SE)
4. Test at 768px width (iPad)
5. Navigate through payment and enrollment flow

**Expected Results:**
- ✓ All elements visible and clickable
- ✓ Text readable
- ✓ Buttons properly sized
- ✓ Forms responsive
- ✓ No horizontal scrolling

---

### TC10: Error Recovery
**Objective:** Verify error handling and recovery

**Steps:**
1. Start payment flow
2. Simulate network error (DevTools > Network > Offline)
3. Try to complete payment
4. Verify error message
5. Go back online
6. Retry payment

**Expected Results:**
- ✓ Clear error message displayed
- ✓ Can retry after fixing issue
- ✓ No duplicate payments created

---

## Regression Tests

### RT1: Existing Functionality
- [ ] Candidate registration still works
- [ ] Email verification still works
- [ ] Login/logout still works
- [ ] Dashboard displays correctly
- [ ] Contests list displays correctly
- [ ] Admin dashboard still works
- [ ] Manager dashboard still works

### RT2: Navigation
- [ ] All menu items work
- [ ] Back buttons work
- [ ] Sidebar navigation works
- [ ] Breadcrumbs work (if applicable)

### RT3: Data Integrity
- [ ] No duplicate payments created
- [ ] No duplicate registrations created
- [ ] Documents stored correctly
- [ ] Enrollment data saved correctly

---

## Performance Tests

### PT1: Payment Processing
- Time to complete payment: < 2 seconds
- QR code generation: < 1 second
- Page load time: < 3 seconds

### PT2: Document Upload
- Upload 2MB file: < 5 seconds
- Multiple uploads: < 10 seconds total

### PT3: Database Queries
- Payment check: < 100ms
- Enrollment submission: < 500ms

---

## Security Tests

### ST1: Authorization
- [ ] Cannot access payment without login
- [ ] Cannot access enrollment without login
- [ ] Cannot access other candidate's data
- [ ] Cannot modify other candidate's payments

### ST2: Data Validation
- [ ] Invalid file types rejected
- [ ] Oversized files rejected
- [ ] SQL injection attempts blocked
- [ ] XSS attempts blocked

### ST3: Payment Security
- [ ] Transaction IDs unique
- [ ] QR codes contain correct data
- [ ] Payment status cannot be manually changed
- [ ] Duplicate payments prevented

---

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## Checklist Before Release

- [ ] All test cases pass
- [ ] No console errors
- [ ] No console warnings
- [ ] Mobile responsive
- [ ] Performance acceptable
- [ ] Security validated
- [ ] Documentation complete
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] CORS configured
- [ ] Email notifications working
- [ ] QR codes generating
- [ ] File storage working
- [ ] Payment methods tested
- [ ] Error messages clear

---

## Known Issues / Limitations

None currently identified.

---

## Support

For issues or questions:
1. Check error message in browser console
2. Check backend logs
3. Verify database connection
4. Verify file permissions
5. Check CORS configuration
