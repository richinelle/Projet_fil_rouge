# Complete User Flow - Payment Mandatory System

## Candidate Journey

### Step 1: Authentication
```
Candidate visits application
↓
Clicks "Se connecter" (Login)
↓
Enters email and password
↓
Email verification (if new candidate)
↓
Redirected to Dashboard
```

### Step 2: Payment (NEW - MANDATORY)
```
Dashboard displays
↓
Candidate sees "Payer un concours" button in quick actions
↓
Clicks "Payer un concours"
↓
Redirected to /contests-selection page
↓
Sees list of available contests
↓
Selects a contest
↓
Payment card appears on right side
↓
Chooses payment method:
  - 💳 Carte Bancaire
  - 📱 Orange Money
  - 📱 MTN Money
↓
Clicks "✓ Effectuer le paiement"
↓
Payment processed (status: completed)
↓
QR code generated
↓
Contest registration created automatically
↓
Success message: "Paiement effectué avec succès!"
↓
"✓ Payé" badge appears on contest
↓
"➜ Continuer l'inscription" button becomes available
```

### Step 3: Enrollment Form
```
Clicks "➜ Continuer l'inscription"
↓
Redirected to /enrollment?contest={contestId}
↓
Enrollment form displays with 7 steps:
  1. Informations Personnelles
  2. Identification
  3. Adresse
  4. Éducation
  5. Centres
  6. Contact d'Urgence
  7. Documents Requis
↓
Fills steps 1-6 with personal information
↓
Clicks "Suivant" to progress through steps
↓
Reaches step 7 (Documents)
↓
Sees payment requirement notice:
  "⚠️ Paiement Obligatoire
   Vous devez avoir effectué le paiement d'un concours 
   et téléchargé le reçu de paiement avant de pouvoir 
   soumettre votre inscription."
↓
Uploads required documents:
  - Relevé du Bac (PDF/PNG/JPG, max 2MB)
  - Acte de Naissance (PDF/PNG/JPG, max 2MB)
  - CNI Valide (PDF/PNG/JPG, max 2MB)
  - Photo 4x4 (1/4) (PNG/JPG, max 2MB)
  - Photo 4x4 (2/4) (PNG/JPG, max 2MB)
  - Photo 4x4 (3/4) (PNG/JPG, max 2MB)
  - Photo 4x4 (4/4) (PNG/JPG, max 2MB)
↓
Selects contest for payment receipt
↓
Uploads payment receipt with QR code
↓
All documents show "✓" checkmarks
↓
Clicks "✓ Soumettre"
```

### Step 4: Submission Validation
```
System validates:
  ✓ All required documents uploaded
  ✓ Payment receipt exists
  ✓ Payment receipt linked to a contest
  ✓ Completed payment exists for that contest
↓
If validation passes:
  ✓ Enrollment status changed to "submitted"
  ✓ Notification sent to department head
  ✓ Success message: "Inscription soumise avec succès!"
  ✓ Redirected to Dashboard
↓
If validation fails:
  ✗ Error message displayed
  ✗ If payment missing: "Payment must be completed..."
  ✗ Offer to redirect to payment page
```

### Step 5: Dashboard After Submission
```
Dashboard displays:
  - Enrollment status: "Inscription soumise" (100%)
  - Document count badge updated
  - "Voir mes documents" section shows all uploaded documents
  - Download buttons for each document
  - Payment history visible
```

## Error Scenarios

### Scenario 1: Missing Payment
```
Candidate tries to submit enrollment without payment
↓
System checks for completed payment
↓
Error: "Payment must be completed for the selected contest before submission"
↓
Confirmation dialog: "Vous devez effectuer un paiement. 
                     Voulez-vous aller à la page de paiement?"
↓
If Yes: Redirected to /contests-selection
If No: Stays on enrollment form
```

### Scenario 2: Missing Documents
```
Candidate tries to submit without all documents
↓
Error: "Missing required documents"
↓
Lists missing documents
↓
Candidate uploads missing documents
↓
Tries again
```

### Scenario 3: Invalid Document Format
```
Candidate uploads wrong file type
↓
Error: "Type de fichier non autorisé. 
        Formats acceptés: PNG, JPG, PDF"
↓
Candidate uploads correct format
```

### Scenario 4: Document Too Large
```
Candidate uploads file > 2MB
↓
Error: "Le fichier dépasse la taille maximale de 2MB 
        (taille actuelle: X.XXMB)"
↓
Candidate compresses and re-uploads
```

## Payment Methods

### 1. Carte Bancaire (Card)
- Standard credit/debit card payment
- Generates QR code for verification
- Instant confirmation

### 2. Orange Money
- Mobile money payment
- Generates QR code for verification
- Instant confirmation

### 3. MTN Money
- Mobile money payment
- Generates QR code for verification
- Instant confirmation

## Key Features

### Payment Receipt
- Contains transaction ID
- Includes QR code with verification link
- Shows:
  - Candidate name and email
  - Contest title
  - Amount in FCFA
  - Payment method
  - Payment status
  - Date and time

### Document Management
- Maximum 2MB per file
- Accepted formats: PNG, JPG, JPEG, PDF
- 4 separate photo uploads (4x4 format)
- Payment receipt linked to specific contest
- All documents downloadable from dashboard

### Notifications
- Department head notified when enrollment submitted
- Notifications include enrollment details
- Accessible from manager dashboard

## Security Features

- JWT authentication required
- Payment validation before submission
- Document type validation
- File size validation
- QR code verification
- Transaction ID tracking
- Candidate authorization checks

## Mobile Responsiveness

- All pages responsive on mobile devices
- Touch-friendly buttons and inputs
- Optimized grid layouts
- Readable text sizes
- Smooth scrolling

## Accessibility

- Clear error messages
- Helpful hints and labels
- Progress indicators
- Back buttons for navigation
- Confirmation dialogs for important actions
- Color-coded status indicators

## Performance

- Lazy loading of contests
- Efficient document uploads
- QR code generation on-demand
- Optimized database queries
- Caching where appropriate

## Compliance

- FCFA currency for all amounts
- French language interface
- Data privacy protection
- Secure payment handling
- Audit trail for all transactions
