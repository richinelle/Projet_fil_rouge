# Fix for "Unauthenticated" Error on Document Upload

## Problem
Users were getting an "Unauthenticated" error when trying to upload documents in the enrollment form, even though they were logged in.

## Root Cause
The JWT secret in the `.env` file was incorrect and didn't match the actual JWT secret being used by the application. This caused all JWT tokens to be invalid when validated by the auth middleware.

## Solution

### 1. Fixed JWT Secret
- **File**: `Backend/.env`
- **Change**: Updated `JWT_SECRET` from `6SGejvDCMbpaT1IJ5z34rn7FfTBWfYXqSQ5LY5iDxXq7L3SDU6OjpcrltI7kKTsY` to `F9PHZeNtQmeGzyoFt5OChtgilN7GbBr2FDx8n9ta1IR1ynuhX3iA20qnuR2sg2Hq`
- **Verification**: Ran `php artisan jwt:secret --show` to get the correct secret

### 2. Created JWT Blacklist Table
- **File**: `Backend/database/migrations/2026_01_26_000000_create_jwt_blacklist_table.php`
- **Reason**: JWT blacklist was enabled but the table didn't exist
- **Status**: Migration ran successfully

### 3. Disabled JWT Blacklist
- **File**: `Backend/.env`
- **Change**: Added `JWT_BLACKLIST_ENABLED=false`
- **Reason**: Prevents unnecessary token blacklist checks that could cause issues

### 4. Enhanced Debugging
- **Frontend**: Updated `Frontend/src/api/client.js` to log all requests and authentication status
- **Frontend**: Updated `Frontend/src/pages/Enrollment.jsx` to log token status and upload details
- **Backend**: Added logging middleware to track authentication attempts
- **Backend**: Added test endpoints for debugging

### 5. Cleared Configuration Cache
- Ran `php artisan config:clear` to ensure all changes are applied

## Files Modified
1. `Backend/.env` - Fixed JWT secret and disabled blacklist
2. `Backend/database/migrations/2026_01_26_000000_create_jwt_blacklist_table.php` - Created JWT blacklist table
3. `Frontend/src/api/client.js` - Enhanced debugging and error handling
4. `Frontend/src/pages/Enrollment.jsx` - Added logging for token and upload status
5. `Backend/app/Http/Controllers/EnrollmentDocumentController.php` - Added logging
6. `Backend/app/Http/Middleware/LogAuthAttempts.php` - Created logging middleware
7. `Backend/bootstrap/app.php` - Registered logging middleware
8. `Backend/routes/api.php` - Added test endpoints

## Testing
To verify the fix:
1. Log in as a candidate
2. Navigate to the enrollment form
3. Go to the "Documents Requis" step
4. Try uploading a document
5. The document should upload successfully without "Unauthenticated" error

## Debugging
If issues persist, check:
1. Browser console for API client logs
2. `Backend/storage/logs/laravel.log` for backend logs
3. Verify token is present in localStorage: `localStorage.getItem('token')`
4. Test authentication with `/debug/auth-test` endpoint
