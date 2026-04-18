# Requirements Document: Multi-Contest Enrollment

## Introduction

This feature enables candidates to register for multiple different contests while maintaining data integrity and preventing duplicate registrations for the same contest. Each contest registration can have different enrollment data (department, filière, exam center, etc.) tailored to the specific contest requirements.

## Glossary

- **Candidate**: A user who participates in contests
- **Contest**: A competition event that candidates can register for
- **Enrollment**: The detailed registration information for a candidate in a specific contest
- **ContestRegistration**: The link between a candidate and a contest
- **Exam_Center**: The physical location where a contest exam takes place
- **Deposit_Center**: The location where candidates deposit required documents
- **Department**: An organizational unit (e.g., Engineering, Medicine)
- **Filière**: A field of study or specialization within a department

## Requirements

### Requirement 1: Multiple Contest Registration

**User Story:** As a candidate, I want to register for multiple different contests, so that I can participate in various competitions that match my interests and qualifications.

#### Acceptance Criteria

1. WHEN a candidate registers for a contest, THE System SHALL create a new enrollment record linked to that specific contest
2. WHEN a candidate attempts to register for a second contest, THE System SHALL allow the registration and create a separate enrollment record
3. WHEN retrieving a candidate's enrollments, THE System SHALL return all enrollments across all contests the candidate is registered for
4. WHEN a candidate views their profile, THE System SHALL display all contests they are registered for with their respective enrollment statuses

### Requirement 2: Contest-Specific Enrollment Data

**User Story:** As a candidate, I want to provide different enrollment information for each contest, so that I can tailor my registration to each contest's specific requirements.

#### Acceptance Criteria

1. WHEN a candidate registers for a contest, THE System SHALL allow them to specify department and filière specific to that contest
2. WHEN a candidate registers for a contest, THE System SHALL allow them to select an exam center specific to that contest
3. WHEN a candidate registers for a contest, THE System SHALL allow them to select a deposit center specific to that contest
4. WHEN a candidate registers for different contests, THE System SHALL store different enrollment data for each contest independently
5. WHEN retrieving enrollment data for a specific contest, THE System SHALL return only the data relevant to that contest registration

### Requirement 3: Duplicate Registration Prevention

**User Story:** As a system administrator, I want to prevent candidates from registering twice for the same contest, so that I can maintain data integrity and accurate participant counts.

#### Acceptance Criteria

1. WHEN a candidate attempts to register for a contest they are already registered for, THE System SHALL reject the registration and return an error message
2. WHEN checking if a candidate can register for a contest, THE System SHALL verify that no existing registration exists for that candidate-contest combination
3. IF a candidate tries to submit a duplicate registration, THEN THE System SHALL prevent the submission and inform the candidate they are already registered
4. WHEN a candidate is registered for a contest, THE System SHALL maintain a unique constraint on the candidate-contest pair

### Requirement 4: Enrollment Data Consistency

**User Story:** As a system administrator, I want to ensure enrollment data remains consistent across multiple registrations, so that the system maintains data integrity.

#### Acceptance Criteria

1. WHEN an enrollment is created for a contest, THE System SHALL validate that all required fields are present
2. WHEN an enrollment is updated, THE System SHALL ensure the update only affects the specific contest registration
3. WHEN a candidate's personal information (name, email, phone) is updated, THE System SHALL reflect these changes across all their enrollments
4. WHEN an enrollment is deleted, THE System SHALL only remove that specific contest registration, not affect other registrations

### Requirement 5: Contest Registration Relationship

**User Story:** As a developer, I want clear relationships between candidates, contests, and enrollments, so that the system is maintainable and queries are efficient.

#### Acceptance Criteria

1. THE Candidate Model SHALL have a hasMany relationship with Enrollment records
2. THE Contest Model SHALL have a hasMany relationship with Enrollment records through ContestRegistration
3. WHEN querying a candidate's enrollments, THE System SHALL efficiently retrieve all related enrollments with their contest information
4. WHEN querying a contest's participants, THE System SHALL efficiently retrieve all candidates registered for that contest

### Requirement 6: Enrollment Status Management

**User Story:** As an administrator, I want to manage enrollment statuses independently for each contest, so that I can track the progress of each registration separately.

#### Acceptance Criteria

1. WHEN an enrollment is created, THE System SHALL set its initial status to 'incomplete'
2. WHEN an enrollment is submitted, THE System SHALL update its status to 'submitted' and record the submission timestamp
3. WHEN an enrollment is approved, THE System SHALL update its status to 'approved' and record the approval timestamp
4. WHEN an enrollment is rejected, THE System SHALL update its status to 'rejected' and store the rejection reason
5. WHEN retrieving enrollment status, THE System SHALL return the status specific to that contest registration

### Requirement 7: Data Migration and Backward Compatibility

**User Story:** As a system administrator, I want to migrate existing enrollment data to the new multi-contest structure, so that the system can transition smoothly without data loss.

#### Acceptance Criteria

1. WHEN the migration runs, THE System SHALL convert existing single enrollments to the new multi-contest structure
2. WHEN a candidate has an existing enrollment, THE System SHALL link it to their first contest registration if available
3. WHEN the migration completes, THE System SHALL preserve all existing enrollment data and relationships
4. WHEN the migration is rolled back, THE System SHALL restore the original single-enrollment structure

