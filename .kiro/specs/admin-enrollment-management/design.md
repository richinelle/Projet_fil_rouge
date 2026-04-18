# Design Document: Admin Enrollment Management

## Overview

The Admin Enrollment Management feature provides administrators with a comprehensive interface to manage candidate enrollments. Admins can view all enrollments in a paginated, filterable list, access detailed enrollment information including documents, approve or reject applications with optional reasons, and track all actions through audit logging. The system automatically sends email notifications to candidates upon approval or rejection and maintains a complete audit trail of all administrative actions.

## Architecture

The admin enrollment management system follows a layered architecture:

1. **Presentation Layer**: Admin dashboard and enrollment management UI components
2. **Service Layer**: EnrollmentManagementService handles business logic for approvals, rejections, and filtering
3. **Repository Layer**: EnrollmentRepository provides data access with filtering and pagination
4. **Notification Layer**: Integration with email service for candidate notifications
5. **Audit Layer**: AuditLogService tracks all administrative actions
6. **Document Layer**: DocumentService manages document storage and retrieval

The system integrates with existing Laravel infrastructure, using Eloquent ORM for data access and the existing notification system for email delivery.

## Components and Interfaces

### EnrollmentManagementService

Handles core business logic for enrollment management operations.

```php
class EnrollmentManagementService
{
    /**
     * Get paginated list of enrollments with filters
     * 
     * @param array $filters (status, department, filiere, search)
     * @param int $page
     * @param int $perPage
     * @param string $sortBy
     * @param string $sortOrder
     * @return LengthAwarePaginator
     */
    public function getEnrollmentsList(
        array $filters = [],
        int $page = 1,
        int $perPage = 20,
        string $sortBy = 'created_at',
        string $sortOrder = 'desc'
    ): LengthAwarePaginator
    
    /**
     * Get enrollment details with related data
     * 
     * @param int $enrollmentId
     * @return Enrollment
     */
    public function getEnrollmentDetails(int $enrollmentId): Enrollment
    
    /**
     * Approve an enrollment
     * 
     * @param int $enrollmentId
     * @param int $adminId
     * @return bool
     */
    public function approveEnrollment(int $enrollmentId, int $adminId): bool
    
    /**
     * Reject an enrollment with reason
     * 
     * @param int $enrollmentId
     * @param string $reason
     * @param int $adminId
     * @return bool
     */
    public function rejectEnrollment(int $enrollmentId, string $reason, int $adminId): bool
    
    /**
     * Check if enrollment can be approved/rejected
     * 
     * @param int $enrollmentId
     * @return bool
     */
    private function canModifyEnrollment(int $enrollmentId): bool
    
    /**
     * Get dashboard summary statistics
     * 
     * @return array
     */
    public function getDashboardSummary(): array
}
```

### EnrollmentRepository

Provides data access with filtering and pagination capabilities.

```php
class EnrollmentRepository
{
    /**
     * Get enrollments with filters and pagination
     * 
     * @param array $filters
     * @param int $page
     * @param int $perPage
     * @param string $sortBy
     * @param string $sortOrder
     * @return LengthAwarePaginator
     */
    public function getFiltered(
        array $filters,
        int $page,
        int $perPage,
        string $sortBy,
        string $sortOrder
    ): LengthAwarePaginator
    
    /**
     * Get enrollments by status
     * 
     * @param string $status
     * @return Collection
     */
    public function getByStatus(string $status): Collection
    
    /**
     * Get recent pending enrollments
     * 
     * @param int $limit
     * @return Collection
     */
    public function getRecentPending(int $limit = 10): Collection
}
```

### AuditLogService

Tracks all administrative actions for accountability and troubleshooting.

```php
class AuditLogService
{
    /**
     * Log an admin action
     * 
     * @param int $adminId
     * @param string $actionType
     * @param int $enrollmentId
     * @param array $details
     */
    public function logAction(
        int $adminId,
        string $actionType,
        int $enrollmentId,
        array $details = []
    ): void
    
    /**
     * Get audit trail for an enrollment
     * 
     * @param int $enrollmentId
     * @return Collection
     */
    public function getEnrollmentAuditTrail(int $enrollmentId): Collection
}
```

### DocumentService

Manages document storage, retrieval, and access control.

```php
class DocumentService
{
    /**
     * Get all documents for an enrollment
     * 
     * @param int $enrollmentId
     * @return Collection
     */
    public function getEnrollmentDocuments(int $enrollmentId): Collection
    
    /**
     * Download a document
     * 
     * @param int $documentId
     * @param int $adminId
     * @return StreamedResponse
     */
    public function downloadDocument(int $documentId, int $adminId): StreamedResponse
    
    /**
     * Verify admin has access to enrollment
     * 
     * @param int $adminId
     * @param int $enrollmentId
     * @return bool
     */
    private function verifyAccess(int $adminId, int $enrollmentId): bool
}
```

## Data Models

### Enrollment Model

```php
class Enrollment extends Model
{
    protected $fillable = [
        'candidate_id',
        'status',           // pending, approved, rejected
        'submission_date',
        'department_id',
        'filiere_id',
    ];
    
    protected $casts = [
        'submission_date' => 'datetime',
    ];
    
    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }
    
    public function documents()
    {
        return $this->hasMany(Document::class);
    }
    
    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }
}
```

### AuditLog Model

```php
class AuditLog extends Model
{
    protected $fillable = [
        'admin_id',
        'enrollment_id',
        'action_type',      // approve, reject, view, search, download
        'details',          // JSON field for additional data
        'created_at',
    ];
    
    protected $casts = [
        'details' => 'json',
        'created_at' => 'datetime',
    ];
}
```

### EnrollmentApprovalHistory Model

```php
class EnrollmentApprovalHistory extends Model
{
    protected $fillable = [
        'enrollment_id',
        'admin_id',
        'action',           // approve, reject
        'reason',           // for rejections
        'action_date',
    ];
    
    protected $casts = [
        'action_date' => 'datetime',
    ];
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Dashboard Status Counts Are Accurate

*For any* set of enrollments with various statuses, the dashboard summary SHALL display counts that match the actual number of enrollments in each status.

**Validates: Requirements 1.2**

### Property 2: Dashboard Shows Most Recent Pending Enrollments

*For any* set of pending enrollments, the dashboard SHALL display the 10 most recent pending enrollments ordered by submission date descending.

**Validates: Requirements 1.3**

### Property 3: Dashboard Displays Required Enrollment Fields

*For any* enrollment displayed on the dashboard, the display SHALL include candidate name, submission date, and status.

**Validates: Requirements 1.4**

### Property 4: Enrollment List Pagination Is Correct

*For any* set of enrollments, the list SHALL display exactly 20 enrollments per page (or the configured page size).

**Validates: Requirements 2.1**

### Property 5: Search Filters by Candidate Name

*For any* search query and set of enrollments, the list SHALL display only enrollments where the candidate name contains the search term (case-insensitive).

**Validates: Requirements 2.2**

### Property 6: Status Filter Works Correctly

*For any* status filter and set of enrollments, the list SHALL display only enrollments with the selected status.

**Validates: Requirements 2.3**

### Property 7: Department Filter Works Correctly

*For any* department filter and set of enrollments, the list SHALL display only enrollments from the selected department.

**Validates: Requirements 2.4**

### Property 8: Program Filter Works Correctly

*For any* program filter and set of enrollments, the list SHALL display only enrollments for the selected program.

**Validates: Requirements 2.5**

### Property 9: Multiple Filters Apply With AND Logic

*For any* combination of filters applied simultaneously, the list SHALL display only enrollments that satisfy ALL filter conditions.

**Validates: Requirements 2.6**

### Property 10: Sorting Works Correctly

*For any* sort column and sort order, the list SHALL reorder enrollments correctly by the selected column in the specified order.

**Validates: Requirements 2.7**

### Property 11: Filter State Persists Across Pagination

*For any* filters applied and page change, the list SHALL maintain all filters when loading the next page.

**Validates: Requirements 2.8**

### Property 12: Clearing Filters Shows All Enrollments

*For any* set of applied filters, clearing filters SHALL display all enrollments without any filter restrictions.

**Validates: Requirements 2.9**

### Property 13: Details View Shows All Personal Information

*For any* enrollment, the details view SHALL display all candidate personal information (name, email, phone, address).

**Validates: Requirements 3.1**

### Property 14: Details View Shows Enrollment Metadata

*For any* enrollment, the details view SHALL display the submission date and current status.

**Validates: Requirements 3.2**

### Property 15: Details View Shows All Documents

*For any* enrollment with attached documents, the details view SHALL display all documents with download links.

**Validates: Requirements 3.3**

### Property 16: Details View Shows Department and Program

*For any* enrollment, the details view SHALL display the candidate's selected department and program.

**Validates: Requirements 3.4**

### Property 17: Details View Shows Approval/Rejection History

*For any* enrollment with previous actions, the details view SHALL display the approval/rejection history.

**Validates: Requirements 3.5**

### Property 18: Details View Shows Audit Trail

*For any* enrollment, the details view SHALL display the audit trail of all actions taken on the enrollment in chronological order.

**Validates: Requirements 3.6**

### Property 19: Approval Updates Status to Approved

*For any* pending enrollment, approving it SHALL update the status to 'approved'.

**Validates: Requirements 4.3**

### Property 20: Rejection Updates Status and Stores Reason

*For any* pending enrollment, rejecting it with a reason SHALL update the status to 'rejected' and store the reason.

**Validates: Requirements 4.5**

### Property 21: Approval Records Admin ID and Timestamp

*For any* approval action, the system SHALL record the admin's user ID and timestamp of the action.

**Validates: Requirements 4.6**

### Property 22: Duplicate Actions Are Prevented

*For any* enrollment that has already been approved or rejected, attempting to approve or reject it again SHALL be prevented.

**Validates: Requirements 4.7**

### Property 23: Approval Email Is Sent

*For any* enrollment that is approved, an approval notification email SHALL be sent to the candidate.

**Validates: Requirements 5.1**

### Property 24: Rejection Email Is Sent With Reason

*For any* enrollment that is rejected, a rejection notification email SHALL be sent to the candidate with the rejection reason.

**Validates: Requirements 5.2**

### Property 25: Approval Email Contains Required Fields

*For any* approval email sent, the email SHALL include the candidate's name, enrollment ID, and approval date.

**Validates: Requirements 5.3**

### Property 26: Rejection Email Contains Required Fields

*For any* rejection email sent, the email SHALL include the candidate's name, enrollment ID, rejection date, and rejection reason.

**Validates: Requirements 5.4**

### Property 27: Email Contains Support Contact Information

*For any* email sent (approval or rejection), the email SHALL include contact information for support.

**Validates: Requirements 5.5**

### Property 28: Email Failure Does Not Block Status Update

*For any* enrollment where email sending fails, the enrollment status SHALL still be updated to approved or rejected.

**Validates: Requirements 5.6**

### Property 29: Email Content Is in French

*For any* email sent (approval or rejection), all text content SHALL be in French language.

**Validates: Requirements 5.7**

### Property 30: Approval Creates Audit Log Entry

*For any* approval action, an audit log entry SHALL be created with the admin ID, action type, enrollment ID, and timestamp.

**Validates: Requirements 6.1**

### Property 31: Rejection Creates Audit Log Entry With Reason

*For any* rejection action, an audit log entry SHALL be created with the admin ID, action type, enrollment ID, rejection reason, and timestamp.

**Validates: Requirements 6.2**

### Property 32: View Action Creates Audit Log Entry

*For any* enrollment details view, an audit log entry SHALL be created with the admin ID, action type, enrollment ID, and timestamp.

**Validates: Requirements 6.3**

### Property 33: Search/Filter Actions Are Logged

*For any* search or filter action, an audit log entry SHALL be created with the admin ID, search/filter criteria, and timestamp.

**Validates: Requirements 6.4**

### Property 34: Audit Logs Are Persisted

*For any* audit log entry created, the entry SHALL be stored in the persistent audit log table.

**Validates: Requirements 6.5**

### Property 35: Audit Trail Is Displayed in Chronological Order

*For any* enrollment, the audit trail SHALL display all actions in chronological order (oldest to newest or newest to oldest consistently).

**Validates: Requirements 6.6**

### Property 36: Documents Display With Metadata

*For any* enrollment with documents, the details view SHALL display all documents with file names and sizes.

**Validates: Requirements 7.1**

### Property 37: Document Download Is Logged

*For any* document download, an audit log entry SHALL be created recording the download action.

**Validates: Requirements 7.3**

### Property 38: Document Access Is Permission-Checked

*For any* document download attempt, the system SHALL verify the admin has permission to access the enrollment before allowing the download.

**Validates: Requirements 7.5**

### Property 39: Pagination Controls Are Displayed

*For any* enrollment list with multiple pages, pagination controls SHALL be displayed (previous, next, page numbers).

**Validates: Requirements 8.1**

### Property 40: Page Navigation Works Correctly

*For any* page number clicked, the list SHALL load the correct page of enrollments.

**Validates: Requirements 8.2**

### Property 41: Column Sorting Works Correctly

*For any* column sort applied, the list SHALL reorder enrollments in the specified ascending or descending order.

**Validates: Requirements 8.3**

### Property 42: Page Size Change Works Correctly

*For any* page size change, the list SHALL update to display the new number of enrollments per page.

**Validates: Requirements 8.4**

### Property 43: Filters and Sort Persist Across Pages

*For any* combination of filters and sort applied, changing pages SHALL maintain both filters and sort order.

**Validates: Requirements 8.5**

### Property 44: Export Generates File With Correct Data

*For any* export action, the system SHALL generate a file (CSV or Excel) containing all visible enrollments with all enrollment data.

**Validates: Requirements 9.2, 9.3**

### Property 45: Export Applies Current Filters

*For any* export action with filters applied, the exported file SHALL contain only the filtered enrollments.

**Validates: Requirements 9.4**

### Property 46: Export Action Is Logged

*For any* export action, an audit log entry SHALL be created recording the export.

**Validates: Requirements 9.5**

## Error Handling

The system implements comprehensive error handling:

1. **Duplicate Action Prevention**: Attempting to approve/reject an already processed enrollment returns an error without modifying the enrollment
2. **Missing Documents**: If a document is not found, an error message is displayed and the download is prevented
3. **Permission Denied**: If an admin lacks access to an enrollment, an error is returned
4. **Email Failures**: Email sending failures are logged but do not prevent enrollment status updates
5. **Invalid Filters**: Invalid filter values are sanitized or ignored
6. **Database Errors**: Database errors are logged and appropriate error messages are returned to the user

All errors are logged with:
- Admin ID and timestamp
- Error type and message
- Enrollment ID (if applicable)
- Stack trace for debugging

## Testing Strategy

### Unit Tests

Unit tests verify specific examples and edge cases:

1. **Dashboard Summary**
   - Correct count calculations for each status
   - Handling of empty enrollment lists
   - Correct selection of 10 most recent pending enrollments

2. **Filtering and Search**
   - Case-insensitive name search
   - Multiple filter combinations
   - Filter state persistence
   - Pagination with filters

3. **Approval/Rejection**
   - Status updates correctly
   - Duplicate action prevention
   - Reason storage for rejections
   - Admin ID and timestamp recording

4. **Email Notifications**
   - Approval email content
   - Rejection email with reason
   - Email failure handling
   - French language verification

5. **Audit Logging**
   - Log entry creation for all actions
   - Correct field population
   - Chronological ordering
   - Persistence verification

6. **Document Management**
   - Document display with metadata
   - Download functionality
   - Permission checking
   - Missing document handling

### Property-Based Tests

Property-based tests verify universal properties across many generated inputs:

1. **List Filtering Properties** (Properties 5-9, 11-12)
   - For all filter combinations, only matching enrollments are shown
   - For all searches, results match the search term
   - For all page changes, filters persist
   - Test with various enrollment data and filter values

2. **Approval/Rejection Properties** (Properties 19-22)
   - For all approvals, status changes to 'approved'
   - For all rejections, status changes to 'rejected' with reason
   - For all actions, admin ID and timestamp are recorded
   - For all duplicate attempts, action is prevented

3. **Email Properties** (Properties 23-29)
   - For all approvals, email is sent
   - For all rejections, email with reason is sent
   - For all emails, required fields are present
   - For all email failures, status is still updated
   - For all emails, content is in French

4. **Audit Logging Properties** (Properties 30-35)
   - For all actions, audit logs are created
   - For all logs, required fields are present
   - For all logs, entries are persisted
   - For all enrollments, audit trail is in chronological order

5. **Pagination and Sorting Properties** (Properties 40-43)
   - For all page changes, correct enrollments are loaded
   - For all sorts, enrollments are ordered correctly
   - For all page size changes, correct number is displayed
   - For all combinations, filters and sort persist

6. **Export Properties** (Properties 44-46)
   - For all exports, file contains all visible enrollments
   - For all exports with filters, only filtered data is exported
   - For all exports, action is logged

**Test Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with: `Feature: admin-enrollment-management, Property {number}: {property_text}`
- Use fast-check or similar library for property generation
- Mock external services (email, database) for deterministic testing

## Integration Points

**With Existing Systems**:
- Uses existing Candidate and Enrollment models
- Integrates with existing email notification system
- Uses existing Laravel authentication for admin verification
- Stores audit logs in new AuditLog table
- Uses existing document storage system

**API Endpoints**:
- GET `/api/admin/enrollments` - List with filters and pagination
- GET `/api/admin/enrollments/{id}` - Get enrollment details
- POST `/api/admin/enrollments/{id}/approve` - Approve enrollment
- POST `/api/admin/enrollments/{id}/reject` - Reject enrollment
- GET `/api/admin/enrollments/{id}/documents/{docId}/download` - Download document
- GET `/api/admin/dashboard` - Get dashboard summary
- POST `/api/admin/enrollments/export` - Export enrollments
