# Requirements Document: Admin Enrollment Management

## Introduction

Cette fonctionnalité permet aux administrateurs de gérer les candidatures soumises par les candidats. L'admin peut visualiser toutes les candidatures, consulter les détails complets, approuver ou rejeter les candidatures, et filtrer/rechercher parmi les candidatures. Chaque action d'approbation ou de rejet déclenche une notification email au candidat et est enregistrée dans les logs d'audit.

## Glossary

- **Admin**: Utilisateur avec les permissions d'administration pour gérer les candidatures
- **Candidate**: Utilisateur qui a soumis une candidature
- **Enrollment**: Formulaire d'inscription complet soumis par un candidat
- **Enrollment_Status**: État de la candidature (pending, approved, rejected)
- **Admin_Dashboard**: Interface d'administration pour gérer les candidatures
- **Enrollment_List**: Liste paginée et filtrée des candidatures
- **Enrollment_Details**: Vue détaillée d'une candidature avec tous les documents
- **Approval_Action**: Action d'approbation d'une candidature par l'admin
- **Rejection_Action**: Action de rejet d'une candidature par l'admin
- **Audit_Log**: Enregistrement des actions effectuées par l'admin
- **Email_Notification**: Email envoyé au candidat après approbation/rejet
- **Document**: Fichier attaché à une candidature (CV, diplômes, etc.)

## Requirements

### Requirement 1: Admin Dashboard for Pending Enrollments

**User Story:** As an admin, I want to see a dashboard showing pending enrollments, so that I can quickly identify and process new applications.

#### Acceptance Criteria

1. WHEN an admin accesses the admin dashboard, THE Dashboard SHALL display a summary of pending enrollments count
2. WHEN the dashboard loads, THE Dashboard SHALL display the number of enrollments by status (pending, approved, rejected)
3. WHEN the dashboard loads, THE Dashboard SHALL display a list of the most recent pending enrollments (last 10)
4. WHEN an admin views the dashboard, THE Dashboard SHALL display the candidate name, submission date, and status for each enrollment
5. WHEN an admin clicks on an enrollment in the dashboard, THE System SHALL navigate to the enrollment details page

### Requirement 2: Enrollment List with Filtering and Search

**User Story:** As an admin, I want to view all enrollments with filtering and search capabilities, so that I can quickly find specific applications.

#### Acceptance Criteria

1. WHEN an admin accesses the enrollment list page, THE List SHALL display all enrollments with pagination (default 20 per page)
2. WHEN an admin searches by candidate name, THE List SHALL filter enrollments to show only matching candidates
3. WHEN an admin filters by status, THE List SHALL display only enrollments with the selected status (pending, approved, rejected)
4. WHEN an admin filters by department, THE List SHALL display only enrollments from the selected department
5. WHEN an admin filters by filière (program), THE List SHALL display only enrollments for the selected program
6. WHEN an admin applies multiple filters, THE List SHALL apply all filters simultaneously (AND logic)
7. WHEN an admin sorts by column, THE List SHALL reorder enrollments by the selected column (name, date, status)
8. WHEN an admin changes the page, THE List SHALL load the next set of enrollments without losing filter/search state
9. WHEN an admin clears filters, THE List SHALL reset to show all enrollments

### Requirement 3: Enrollment Details View

**User Story:** As an admin, I want to view complete details of an enrollment including all documents, so that I can make informed approval/rejection decisions.

#### Acceptance Criteria

1. WHEN an admin opens an enrollment details page, THE Details_View SHALL display all candidate personal information (name, email, phone, address)
2. WHEN the details page loads, THE Details_View SHALL display the enrollment submission date and current status
3. WHEN the details page loads, THE Details_View SHALL display all attached documents with download links
4. WHEN the details page loads, THE Details_View SHALL display the candidate's selected department and program
5. WHEN an admin views the details, THE Details_View SHALL display any previous approval/rejection history for this candidate
6. WHEN an admin views the details, THE Details_View SHALL display the audit trail of all actions taken on this enrollment

### Requirement 4: Approval and Rejection Actions

**User Story:** As an admin, I want to approve or reject enrollments with an optional reason, so that I can process applications and communicate decisions to candidates.

#### Acceptance Criteria

1. WHEN an admin is viewing enrollment details, THE System SHALL display an "Approve" button and a "Reject" button
2. WHEN an admin clicks the Approve button, THE System SHALL show a confirmation dialog before processing
3. WHEN an admin confirms approval, THE System SHALL update the enrollment status to 'approved'
4. WHEN an admin clicks the Reject button, THE System SHALL show a dialog to enter a rejection reason
5. WHEN an admin enters a rejection reason and confirms, THE System SHALL update the enrollment status to 'rejected' and store the reason
6. WHEN an admin approves or rejects an enrollment, THE System SHALL record the admin's user ID and timestamp of the action
7. WHEN an admin approves or rejects an enrollment, THE System SHALL prevent duplicate actions on the same enrollment
8. IF an admin attempts to approve an already approved enrollment, THEN THE System SHALL display an error message and prevent the action

### Requirement 5: Email Notifications to Candidates

**User Story:** As a candidate, I want to receive an email notification when my enrollment is approved or rejected, so that I know the status of my application.

#### Acceptance Criteria

1. WHEN an admin approves an enrollment, THE Email_Service SHALL send an approval notification email to the candidate
2. WHEN an admin rejects an enrollment, THE Email_Service SHALL send a rejection notification email to the candidate with the rejection reason
3. WHEN an approval email is sent, THE Email SHALL include the candidate's name, enrollment ID, and approval date
4. WHEN a rejection email is sent, THE Email SHALL include the candidate's name, enrollment ID, rejection date, and the rejection reason
5. WHEN an email is sent, THE Email SHALL include contact information for support
6. IF email sending fails, THEN THE System SHALL log the failure but still mark the enrollment as approved/rejected
7. WHEN an email is sent, THE Email SHALL be in French language

### Requirement 6: Audit Logging

**User Story:** As a system administrator, I want to track all admin actions on enrollments, so that I can maintain accountability and troubleshoot issues.

#### Acceptance Criteria

1. WHEN an admin approves an enrollment, THE System SHALL create an audit log entry with the admin ID, action type, enrollment ID, and timestamp
2. WHEN an admin rejects an enrollment, THE System SHALL create an audit log entry with the admin ID, action type, enrollment ID, rejection reason, and timestamp
3. WHEN an admin views enrollment details, THE System SHALL create an audit log entry with the admin ID, action type, enrollment ID, and timestamp
4. WHEN an admin searches or filters enrollments, THE System SHALL create an audit log entry with the admin ID, search/filter criteria, and timestamp
5. WHEN an audit log is created, THE System SHALL store the log entry in a persistent audit log table
6. WHEN an admin views the audit trail, THE System SHALL display all actions taken on an enrollment in chronological order

### Requirement 7: Document Download

**User Story:** As an admin, I want to download documents attached to an enrollment, so that I can review candidate materials offline.

#### Acceptance Criteria

1. WHEN an admin views enrollment details, THE System SHALL display all attached documents with file names and sizes
2. WHEN an admin clicks a document download link, THE System SHALL initiate a file download
3. WHEN a document is downloaded, THE System SHALL log the download action in the audit trail
4. IF a document is not found or has been deleted, THEN THE System SHALL display an error message
5. WHEN an admin downloads a document, THE System SHALL verify the admin has permission to access the enrollment

### Requirement 8: Pagination and Sorting

**User Story:** As an admin, I want to navigate through large lists of enrollments efficiently, so that I can manage many applications without performance issues.

#### Acceptance Criteria

1. WHEN an admin views the enrollment list, THE List SHALL display pagination controls (previous, next, page numbers)
2. WHEN an admin clicks a page number, THE List SHALL load that page of enrollments
3. WHEN an admin sorts by a column, THE List SHALL reorder enrollments in ascending or descending order
4. WHEN an admin changes the page size, THE List SHALL update the number of enrollments displayed per page
5. WHEN an admin applies filters and sorts, THE List SHALL maintain both filters and sort order across page changes

### Requirement 9: Export Enrollments (Optional)

**User Story:** As an admin, I want to export enrollments to a file format, so that I can analyze data in external tools or create reports.

#### Acceptance Criteria

1. WHERE export functionality is enabled, THE System SHALL provide an export button on the enrollment list page
2. WHEN an admin clicks export, THE System SHALL generate a file (CSV or Excel) with all visible enrollments
3. WHEN an export is generated, THE System SHALL include all enrollment data (candidate info, status, dates, etc.)
4. WHEN an export is generated, THE System SHALL apply current filters to the export (only export filtered results)
5. WHEN an export is completed, THE System SHALL log the export action in the audit trail
