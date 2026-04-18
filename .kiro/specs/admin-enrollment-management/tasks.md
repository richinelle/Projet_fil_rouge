# Implementation Plan: Admin Enrollment Management

## Overview

This implementation plan breaks down the Admin Enrollment Management feature into discrete coding tasks. The approach starts with setting up the core data models and services, then implements the API endpoints, followed by the frontend UI components, and finally integrates everything with comprehensive testing. Each task builds on previous work to ensure incremental progress and early validation.

## Tasks

- [x] 1. Set up project structure and core models
  - Create AuditLog and EnrollmentApprovalHistory models with migrations
  - Create database migrations for audit logging tables
  - Set up model relationships (Enrollment → AuditLog, Enrollment → ApprovalHistory)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [-] 2. Implement EnrollmentRepository with filtering and pagination
  - Create EnrollmentRepository class with getFiltered() method
  - Implement filtering by status, department, filière, and search term
  - Implement pagination and sorting functionality
  - Implement getByStatus() and getRecentPending() methods
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

  - [ ] 2.1 Write property tests for EnrollmentRepository filtering
    - **Property 5: Search Filters by Candidate Name**
    - **Property 6: Status Filter Works Correctly**
    - **Property 7: Department Filter Works Correctly**
    - **Property 8: Program Filter Works Correctly**
    - **Property 9: Multiple Filters Apply With AND Logic**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.6**

  - [ ] 2.2 Write property tests for pagination and sorting
    - **Property 4: Enrollment List Pagination Is Correct**
    - **Property 10: Sorting Works Correctly**
    - **Property 11: Filter State Persists Across Pagination**
    - **Validates: Requirements 2.1, 2.7, 2.8**

- [ ] 3. Implement AuditLogService for tracking admin actions
  - Create AuditLogService class with logAction() method
  - Implement getEnrollmentAuditTrail() method
  - Implement action type constants (approve, reject, view, search, download)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ] 3.1 Write property tests for audit logging
    - **Property 30: Approval Creates Audit Log Entry**
    - **Property 31: Rejection Creates Audit Log Entry With Reason**
    - **Property 32: View Action Creates Audit Log Entry**
    - **Property 33: Search/Filter Actions Are Logged**
    - **Property 34: Audit Logs Are Persisted**
    - **Property 35: Audit Trail Is Displayed in Chronological Order**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6**

- [ ] 4. Implement EnrollmentManagementService core methods
  - Create EnrollmentManagementService class
  - Implement getEnrollmentsList() with repository integration
  - Implement getEnrollmentDetails() method
  - Implement getDashboardSummary() method
  - _Requirements: 1.2, 1.3, 2.1, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ] 4.1 Write property tests for dashboard and list retrieval
    - **Property 1: Dashboard Status Counts Are Accurate**
    - **Property 2: Dashboard Shows Most Recent Pending Enrollments**
    - **Property 3: Dashboard Displays Required Enrollment Fields**
    - **Property 13: Details View Shows All Personal Information**
    - **Property 14: Details View Shows Enrollment Metadata**
    - **Property 15: Details View Shows All Documents**
    - **Property 16: Details View Shows Department and Program**
    - **Property 17: Details View Shows Approval/Rejection History**
    - **Property 18: Details View Shows Audit Trail**
    - **Validates: Requirements 1.2, 1.3, 1.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

- [ ] 5. Implement approval and rejection logic
  - Implement approveEnrollment() method in EnrollmentManagementService
  - Implement rejectEnrollment() method with reason storage
  - Implement canModifyEnrollment() validation method
  - Add duplicate action prevention logic
  - _Requirements: 4.3, 4.5, 4.6, 4.7, 4.8_

  - [ ] 5.1 Write property tests for approval/rejection
    - **Property 19: Approval Updates Status to Approved**
    - **Property 20: Rejection Updates Status and Stores Reason**
    - **Property 21: Approval Records Admin ID and Timestamp**
    - **Property 22: Duplicate Actions Are Prevented**
    - **Validates: Requirements 4.3, 4.5, 4.6, 4.7, 4.8**

- [ ] 6. Integrate email notifications with approval/rejection
  - Modify approveEnrollment() to trigger approval email
  - Modify rejectEnrollment() to trigger rejection email with reason
  - Create approval and rejection email templates in French
  - Implement email failure handling (log but don't block status update)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ] 6.1 Write property tests for email notifications
    - **Property 23: Approval Email Is Sent**
    - **Property 24: Rejection Email Is Sent With Reason**
    - **Property 25: Approval Email Contains Required Fields**
    - **Property 26: Rejection Email Contains Required Fields**
    - **Property 27: Email Contains Support Contact Information**
    - **Property 28: Email Failure Does Not Block Status Update**
    - **Property 29: Email Content Is in French**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7**

- [ ] 7. Implement DocumentService for document management
  - Create DocumentService class
  - Implement getEnrollmentDocuments() method
  - Implement downloadDocument() method with permission checking
  - Implement verifyAccess() permission validation
  - Add download logging to AuditLogService
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 7.1 Write property tests for document management
    - **Property 36: Documents Display With Metadata**
    - **Property 37: Document Download Is Logged**
    - **Property 38: Document Access Is Permission-Checked**
    - **Validates: Requirements 7.1, 7.3, 7.5**

- [ ] 8. Create API endpoints for enrollment management
  - Create EnrollmentController with index() method (list with filters)
  - Implement show() method for enrollment details
  - Implement approve() method for approval action
  - Implement reject() method for rejection action
  - Implement download() method for document downloads
  - Register routes in api.php
  - _Requirements: 2.1, 3.1, 4.3, 4.5, 7.2_

- [ ] 9. Create API endpoint for dashboard
  - Create AdminDashboardController with index() method
  - Implement getDashboardSummary() integration
  - Register dashboard route in api.php
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 10. Create API endpoint for export functionality
  - Create ExportController with export() method
  - Implement CSV/Excel export generation
  - Apply current filters to export
  - Add export logging to AuditLogService
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 10.1 Write property tests for export functionality
    - **Property 44: Export Generates File With Correct Data**
    - **Property 45: Export Applies Current Filters**
    - **Property 46: Export Action Is Logged**
    - **Validates: Requirements 9.2, 9.3, 9.4, 9.5**

- [ ] 11. Checkpoint - Ensure all backend tests pass
  - Ensure all property-based tests pass (minimum 100 iterations each)
  - Ensure all unit tests pass
  - Verify no console errors or warnings
  - Ask the user if questions arise

- [ ] 12. Create frontend components for admin dashboard
  - Create AdminDashboard.jsx component
  - Implement dashboard summary display (pending count, status breakdown)
  - Implement recent pending enrollments list
  - Add navigation to enrollment list and details pages
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 13. Create frontend components for enrollment list
  - Create EnrollmentList.jsx component
  - Implement pagination controls and page navigation
  - Implement search input field
  - Implement filter dropdowns (status, department, filière)
  - Implement sort column headers
  - Implement filter state management
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

- [ ] 14. Create frontend components for enrollment details
  - Create EnrollmentDetails.jsx component
  - Display all candidate personal information
  - Display enrollment metadata (submission date, status)
  - Display attached documents with download links
  - Display department and program information
  - Display approval/rejection history
  - Display audit trail in chronological order
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 15. Implement approval/rejection UI in enrollment details
  - Add Approve button with confirmation dialog
  - Add Reject button with reason input dialog
  - Implement form submission to API endpoints
  - Handle success/error responses
  - Refresh enrollment details after action
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [ ] 16. Implement document download functionality
  - Add download links to document display
  - Implement download handler with permission checking
  - Handle download errors gracefully
  - Display error messages for missing documents
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 17. Implement export functionality in frontend
  - Add export button to enrollment list
  - Implement export form with format selection (CSV/Excel)
  - Handle export file download
  - Display success/error messages
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 18. Add styling and responsive design
  - Create AdminEnrollmentManagement.css with responsive layout
  - Style dashboard components
  - Style enrollment list with filters
  - Style enrollment details view
  - Ensure mobile responsiveness
  - _Requirements: All_

- [ ] 19. Checkpoint - Ensure all frontend tests pass
  - Ensure all frontend components render correctly
  - Verify all user interactions work as expected
  - Test responsive design on mobile and desktop
  - Ask the user if questions arise

- [ ] 20. Integration testing
  - Test complete workflow: view dashboard → view list → view details → approve/reject
  - Test email notifications are sent correctly
  - Test audit logs are created for all actions
  - Test document downloads work correctly
  - Test export functionality with filters
  - _Requirements: All_

- [ ] 21. Final checkpoint - Ensure all tests pass
  - Ensure all property-based tests pass (minimum 100 iterations each)
  - Ensure all unit tests pass
  - Ensure all integration tests pass
  - Verify no console errors or warnings
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All email templates should be in French language
- Audit logging is mandatory for all admin actions
- Document access requires permission verification
