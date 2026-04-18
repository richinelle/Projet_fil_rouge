<?php

use App\Http\Controllers\AdminUserManagementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContestController;
use App\Http\Controllers\ContestManagerController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DepositCenterController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\EnrollmentDocumentController;
use App\Http\Controllers\ExamCenterController;
use App\Http\Controllers\FiliereController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\UserAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Candidate authentication
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/verify-email', [AuthController::class, 'verifyEmail']);

// Admin/Manager authentication (public endpoints)
Route::post('/admin/login', [UserAuthController::class, 'login']);
Route::post('/login', [UserAuthController::class, 'login']);

// Public contest routes
Route::get('/contests', [ContestController::class, 'listContests']);
Route::get('/contests/{contestId}', [ContestController::class, 'getContestDetails']);

// Public department and filiere routes (for enrollment form)
Route::get('/departments', [DepartmentController::class, 'index']);
Route::get('/filieres/by-department/{departmentId}', [FiliereController::class, 'getByDepartment']);
Route::get('/exam-centers', [ExamCenterController::class, 'index']);
Route::get('/deposit-centers', [DepositCenterController::class, 'index']);

// Debug route to test authentication
Route::get('/debug/auth-test', function () {
    $user = auth('api')->user();

    return response()->json([
        'authenticated' => auth('api')->check(),
        'user' => $user,
        'token' => request()->header('Authorization'),
    ]);
});

// Test endpoint to verify token is being sent
Route::post('/debug/test-upload', function (Request $request) {
    return response()->json([
        'authenticated' => auth('api')->check(),
        'user' => auth('api')->user(),
        'authHeader' => $request->header('Authorization'),
        'hasFile' => $request->hasFile('file'),
    ]);
});

// Candidate routes (Guard: api)
Route::middleware('auth:api')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'changePassword']);

    // Notification routes for candidates
    Route::get('/notifications/unread', [NotificationController::class, 'getCandidateUnreadNotifications']);
    Route::get('/notifications', [NotificationController::class, 'getCandidateAllNotifications']);
    Route::put('/notifications/{notificationId}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::get('/notifications/count-unread', [NotificationController::class, 'countCandidateUnreadNotifications']);

    // Enrollment routes
    Route::get('/enrollment/status', [EnrollmentController::class, 'getEnrollmentStatus']);
    Route::post('/enrollment/save', [EnrollmentController::class, 'createOrUpdateEnrollment']);
    Route::post('/enrollment/submit', [EnrollmentController::class, 'submitEnrollment']);
    Route::delete('/enrollment/delete', [EnrollmentController::class, 'deleteEnrollment']);
    Route::get('/enrollment/form', [EnrollmentController::class, 'getEnrollmentForm']);
    Route::get('/enrollment/certificate', [EnrollmentController::class, 'downloadMyCertificate']);

    // Enrollment documents
    Route::post('/enrollment/documents/upload', [EnrollmentDocumentController::class, 'uploadDocument']);
    Route::get('/enrollment/documents', [EnrollmentDocumentController::class, 'getEnrollmentDocuments']);
    Route::delete('/enrollment/documents/{documentId}', [EnrollmentDocumentController::class, 'deleteDocument']);
    Route::get('/enrollment/documents/{documentId}/download', [EnrollmentDocumentController::class, 'downloadDocument']);
    Route::get('/enrollment/documents/{documentId}/view', [EnrollmentDocumentController::class, 'viewDocument']);

    // Candidate contest routes
    Route::post('/contests/{contestId}/register', [ContestController::class, 'registerForContest']);
    Route::get('/my-contests', [ContestController::class, 'getMyCandidateContests']);
    Route::delete('/contests/{contestId}/unregister', [ContestController::class, 'unregisterFromContest']);

    // Payment routes
    Route::post('/payment/initiate', [PaymentController::class, 'initiatePayment']);
    Route::get('/payment/receipt/{transactionId}', [PaymentController::class, 'getPaymentReceipt']);
    Route::get('/payment/check/{contestId}', [PaymentController::class, 'checkPaymentStatus']);
});

// Admin/Manager routes (Guard: api-users)
Route::middleware('auth:api-users')->group(function () {
    Route::post('/admin/logout', [UserAuthController::class, 'logout']);
    Route::post('/logout', [UserAuthController::class, 'logout']);
    Route::get('/admin/profile', [UserAuthController::class, 'getProfile']);
    Route::get('/profile', [UserAuthController::class, 'getProfile']);
    Route::put('/admin/profile', [UserAuthController::class, 'updateProfile']);
    Route::put('/profile', [UserAuthController::class, 'updateProfile']);
    Route::put('/admin/password', [UserAuthController::class, 'changePassword']);
    Route::post('/admin/change-password', [UserAuthController::class, 'changePassword']);
    Route::post('/change-password', [UserAuthController::class, 'changePassword']);

    // Notification routes
    Route::get('/notifications/unread', [NotificationController::class, 'getUnreadNotifications']);
    Route::get('/notifications', [NotificationController::class, 'getAllNotifications']);
    Route::put('/notifications/{notificationId}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::get('/notifications/count-unread', [NotificationController::class, 'countUnreadNotifications']);

    // Admin-only routes for user management
    Route::middleware('admin')->group(function () {
        // User management (candidates, managers, admins)
        Route::get('/admin/users', [AdminUserManagementController::class, 'getAllUsers']);
        Route::post('/admin/users', [AdminUserManagementController::class, 'createUser']);
        Route::put('/admin/users/{userId}', [AdminUserManagementController::class, 'updateUser']);
        Route::put('/admin/users/{userId}/role', [AdminUserManagementController::class, 'changeUserRole']);
        Route::put('/admin/users/{userId}/status', [AdminUserManagementController::class, 'toggleUserStatus']);
        Route::delete('/admin/users/{userId}', [AdminUserManagementController::class, 'deleteUser']);

        // Candidate management
        Route::get('/admin/candidates', [AdminUserManagementController::class, 'getAllCandidates']);
        Route::get('/admin/candidates/{candidateId}', [AdminUserManagementController::class, 'getCandidateDetails']);

        // Statistics and activity
        Route::get('/admin/statistics/users', [AdminUserManagementController::class, 'getUserStatistics']);
        Route::get('/admin/activity-log', [AdminUserManagementController::class, 'getActivityLog']);

        // Search
        Route::get('/admin/search', [AdminUserManagementController::class, 'searchUsers']);

        // Contests management
        Route::get('/admin/contests', [ContestController::class, 'getAllContests']);

        // Payments management
        Route::get('/admin/payments', [PaymentController::class, 'getAllPayments']);

        // Enrollment management
        Route::get('/admin/enrollments', [EnrollmentController::class, 'getAllSubmittedEnrollments']);
        Route::get('/admin/inscriptions', [EnrollmentController::class, 'getAllSubmittedEnrollments']);
        Route::get('/admin/enrollments/{enrollmentId}/documents', [EnrollmentController::class, 'getEnrollmentDocuments']);
        Route::get('/admin/inscriptions/{enrollmentId}/documents', [EnrollmentController::class, 'getEnrollmentDocuments']);
        Route::get('/admin/documents/{documentId}/view', [EnrollmentDocumentController::class, 'viewDocumentAdmin']);
        Route::get('/admin/enrollments/{enrollmentId}/certificate', [EnrollmentController::class, 'downloadCertificate']);
        Route::get('/admin/inscriptions/{enrollmentId}/certificate', [EnrollmentController::class, 'downloadCertificate']);
        Route::post('/admin/enrollments/{enrollmentId}/approve', [EnrollmentController::class, 'approveEnrollment']);
        Route::post('/admin/inscriptions/{enrollmentId}/approve', [EnrollmentController::class, 'approveEnrollment']);
        Route::post('/admin/enrollments/{enrollmentId}/reject', [EnrollmentController::class, 'rejectEnrollment']);
        Route::post('/admin/inscriptions/{enrollmentId}/reject', [EnrollmentController::class, 'rejectEnrollment']);
    });

    // Contest manager routes (also manages departments and filières)
    Route::middleware('contest_manager')->group(function () {
        // Contest management
        Route::post('/manager/contests', [ContestManagerController::class, 'createContest']);
        Route::put('/manager/contests/{contestId}', [ContestManagerController::class, 'updateContest']);
        Route::delete('/manager/contests/{contestId}', [ContestManagerController::class, 'deleteContest']);
        Route::get('/manager/contests', [ContestManagerController::class, 'getMyContests']);
        Route::get('/manager/contests/{contestId}/participants', [ContestManagerController::class, 'getContestParticipants']);
        Route::put('/manager/registrations/{registrationId}', [ContestManagerController::class, 'updateParticipantStatus']);

        // Enrollment management
        Route::get('/manager/enrollments', [EnrollmentController::class, 'getAllSubmittedEnrollments']);

        // Department management
        Route::get('/manager/departments', [DepartmentController::class, 'index']);
        Route::post('/manager/departments', [DepartmentController::class, 'store']);
        Route::get('/manager/departments/{departmentId}', [DepartmentController::class, 'show']);
        Route::put('/manager/departments/{departmentId}', [DepartmentController::class, 'update']);
        Route::delete('/manager/departments/{departmentId}', [DepartmentController::class, 'destroy']);
        Route::get('/manager/departments/{departmentId}/stats', [DepartmentController::class, 'getStats']);

        // Filière management
        Route::get('/manager/filieres', [FiliereController::class, 'index']);
        Route::post('/manager/filieres', [FiliereController::class, 'store']);
        Route::get('/manager/filieres/{filiereId}', [FiliereController::class, 'show']);
        Route::put('/manager/filieres/{filiereId}', [FiliereController::class, 'update']);
        Route::delete('/manager/filieres/{filiereId}', [FiliereController::class, 'destroy']);
        Route::get('/manager/filieres/by-department/{departmentId}', [FiliereController::class, 'getByDepartment']);
        Route::get('/manager/filieres/{filiereId}/stats', [FiliereController::class, 'getStats']);

        // Exam center management
        Route::get('/manager/exam-centers', [ExamCenterController::class, 'index']);
        Route::post('/manager/exam-centers', [ExamCenterController::class, 'store']);
        Route::get('/manager/exam-centers/{id}', [ExamCenterController::class, 'show']);
        Route::put('/manager/exam-centers/{id}', [ExamCenterController::class, 'update']);
        Route::delete('/manager/exam-centers/{id}', [ExamCenterController::class, 'destroy']);

        // Deposit center management
        Route::get('/manager/deposit-centers', [DepositCenterController::class, 'index']);
        Route::post('/manager/deposit-centers', [DepositCenterController::class, 'store']);
        Route::get('/manager/deposit-centers/{id}', [DepositCenterController::class, 'show']);
        Route::put('/manager/deposit-centers/{id}', [DepositCenterController::class, 'update']);
        Route::delete('/manager/deposit-centers/{id}', [DepositCenterController::class, 'destroy']);
    });
});

Route::get('/payment/verify/{transaction_id}', [PaymentController::class, 'verifyPayment'])->name('payment.verify');
Route::post('/payment/complete', [PaymentController::class, 'completePayment'])->name('payment.complete');
Route::get('/enrollment/status/{candidateId}', [EnrollmentController::class, 'getEnrollmentStatus']);
Route::get('/enrollment/form/{candidateId}', [EnrollmentController::class, 'getEnrollmentForm']);
