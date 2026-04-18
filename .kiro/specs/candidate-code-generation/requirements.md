# Requirements Document: Candidate Code Generation

## Introduction

This feature enables the automatic generation of unique candidate codes with the "SGEE" prefix when an admin approves a candidate's enrollment. Each candidate receives a unique code that serves as their official identifier throughout the enrollment process and is displayed on their approved enrollment form.

## Glossary

- **Candidate_Code**: A unique identifier for each candidate, formatted as "SGEE" followed by a sequential number
- **Enrollment**: The complete registration record for a candidate applying to a contest
- **Admin**: A system administrator with authority to approve or reject enrollments
- **Approval**: The action by an admin to accept a submitted enrollment
- **Enrollment_Form**: The official document displaying candidate information and their assigned code

## Requirements

### Requirement 1: Candidate Code Generation

**User Story:** As an admin, I want candidate codes to be generated automatically when I approve an enrollment, so that each candidate receives a unique identifier without manual intervention.

#### Acceptance Criteria

1. WHEN an admin approves a submitted enrollment, THE System SHALL generate a unique candidate code with the prefix "SGEE"
2. WHEN a candidate code is generated, THE System SHALL ensure it is unique across all candidates in the system
3. WHEN a candidate code is generated, THE System SHALL store it in the enrollment record
4. WHEN an enrollment is approved, THE System SHALL not allow manual modification of the generated code

### Requirement 2: Code Format and Structure

**User Story:** As a system administrator, I want candidate codes to follow a consistent format, so that codes are easily identifiable and traceable.

#### Acceptance Criteria

1. THE Candidate_Code SHALL start with the prefix "SGEE"
2. THE Candidate_Code SHALL be followed by a sequential numeric identifier
3. THE Candidate_Code SHALL have a fixed total length for consistency
4. WHEN a candidate code is generated, THE System SHALL ensure the numeric portion is zero-padded to maintain consistent formatting

### Requirement 3: Code Uniqueness Guarantee

**User Story:** As a system architect, I want to ensure that no two candidates can have the same code, so that the system maintains data integrity and prevents conflicts.

#### Acceptance Criteria

1. WHEN a new candidate code is generated, THE System SHALL verify it does not already exist in the database
2. IF a generated code already exists, THEN THE System SHALL generate a new code until a unique one is found
3. WHEN an enrollment is approved, THE System SHALL guarantee the assigned code is unique at the moment of assignment

### Requirement 4: Code Display on Approved Enrollment

**User Story:** As a candidate, I want to see my assigned code on my approved enrollment form, so that I have a clear reference for my application.

#### Acceptance Criteria

1. WHEN an enrollment is approved, THE System SHALL display the candidate code on the enrollment form
2. WHEN a candidate views their approved enrollment, THE System SHALL show their assigned candidate code prominently
3. WHEN an admin views an approved enrollment, THE System SHALL display the candidate code in the enrollment details
4. WHEN a candidate downloads their enrollment certificate, THE System SHALL include their candidate code on the document

### Requirement 5: Code Persistence and Immutability

**User Story:** As a system administrator, I want candidate codes to be permanent once assigned, so that candidates have a stable identifier throughout their enrollment lifecycle.

#### Acceptance Criteria

1. WHEN a candidate code is assigned to an enrollment, THE System SHALL store it permanently in the database
2. WHEN an enrollment status changes after approval, THE System SHALL preserve the assigned candidate code
3. IF an admin attempts to modify an approved enrollment, THEN THE System SHALL prevent changes to the candidate code
4. WHEN an enrollment is rejected or deleted, THE System SHALL handle the candidate code appropriately

### Requirement 6: Code Assignment Atomicity

**User Story:** As a system architect, I want code assignment to be atomic and reliable, so that concurrent approvals do not create duplicate codes.

#### Acceptance Criteria

1. WHEN multiple enrollments are approved simultaneously, THE System SHALL ensure each receives a unique candidate code
2. WHEN an enrollment approval is processed, THE System SHALL use database-level constraints to prevent code duplication
3. IF an approval transaction fails, THEN THE System SHALL rollback the code assignment
4. WHEN an enrollment is approved, THE System SHALL complete the entire approval process (status update + code assignment) as a single atomic transaction

### Requirement 7: Code Retrieval and Validation

**User Story:** As a developer, I want to retrieve and validate candidate codes programmatically, so that I can integrate the code system with other features.

#### Acceptance Criteria

1. WHEN querying an enrollment, THE System SHALL return the candidate code if the enrollment is approved
2. WHEN a candidate code is requested, THE System SHALL validate its format before returning it
3. IF a candidate code is requested for a non-approved enrollment, THEN THE System SHALL return null or indicate the code is not yet assigned
4. WHEN searching for an enrollment by candidate code, THE System SHALL return the matching enrollment record

