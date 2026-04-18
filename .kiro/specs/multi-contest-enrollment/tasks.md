# Implementation Tasks: Multi-Contest Enrollment

## Overview

This document outlines the implementation tasks for enabling candidates to register for multiple different contests with independent enrollment data for each contest.

## Task List

### Phase 1: Database Migration

- [ ] 1.1 Create migration to add contest_id to enrollments table
  - Add contest_id column as BIGINT UNSIGNED NULLABLE
  - Add foreign key constraint to contests table
  - Add unique constraint on (candidate_id, contest_id)
  - Add index on contest_id for query performance

- [ ] 1.2 Create migration to update existing enrollments
  - Link existing enrollments to their corresponding contests
  - Handle orphaned enrollments (no contest link)
  - Verify data integrity after migration

### Phase 2: Model Updates

- [ ] 2.1 Update Candidate model
  - Change enrollment relationship from hasOne to hasMany
  - Add getEnrollmentForContest() method
  - Add contests() hasManyThrough relationship
  - Add tests for new relationships

- [ ] 2.2 Update Enrollment model
  - Add contest() BelongsTo relationship
  - Add contest_id to fillable array
  - Add isForContest() method
  - Add getStatus() method
  - Add updateStatus() method
  - Add tests for new methods

- [ ] 2.3 Update Contest model
  - Add enrollments() HasMany relationship
  - Add candidates() hasManyThrough relationship
  - Add isCandidateRegistered() method
  - Add getEnrollmentForCandidate() method
  - Add tests for new methods

### Phase 3: Service Layer

- [ ] 3.1 Create EnrollmentService class
  - Implement createEnrollment() method with duplicate prevention
  - Implement getCandidateEnrollments() method
  - Implement getEnrollment() method
  - Implement updateEnrollment() method
  - Implement deleteEnrollment() method
  - Implement validateEnrollmentData() method
  - Add comprehensive error handling

- [ ] 3.2 Create DuplicateEnrollmentException class
  - Extend appropriate exception class
  - Implement proper error messaging

- [ ] 3.3 Update EnrollmentController
  - Update store() method to use EnrollmentService
  - Update index() method to return all enrollments
  - Update show() method to get specific enrollment
  - Update update() method to use EnrollmentService
  - Update destroy() method to use EnrollmentService
  - Add validation for contest_id parameter

### Phase 4: API Endpoints

- [ ] 4.1 Update enrollment creation endpoint
  - Accept contest_id parameter
  - Validate contest exists
  - Check for duplicate registration
  - Return appropriate error responses

- [ ] 4.2 Update enrollment retrieval endpoints
  - Add endpoint to get all enrollments for a candidate
  - Add endpoint to get specific enrollment for a contest
  - Add filtering by contest_id
  - Add proper pagination

- [ ] 4.3 Update enrollment update endpoint
  - Ensure only specific enrollment is updated
  - Validate contest_id cannot be changed
  - Return updated enrollment with contest details

- [ ] 4.4 Update enrollment deletion endpoint
  - Ensure only specific enrollment is deleted
  - Verify candidate owns the enrollment
  - Return success response

### Phase 5: Frontend Updates

- [ ] 5.1 Update Enrollment page component
  - Display list of all contests candidate can register for
  - Show already registered contests
  - Prevent registration for already registered contests
  - Display all candidate's enrollments

- [ ] 5.2 Update enrollment form
  - Add contest selection
  - Show contest-specific requirements
  - Display different fields based on contest requirements
  - Show validation errors for duplicate registration

- [ ] 5.3 Update Dashboard
  - Display all enrollments across all contests
  - Show enrollment status for each contest
  - Add links to view/edit each enrollment

- [ ] 5.4 Update enrollment management pages
  - Show all enrollments for a candidate
  - Filter by contest
  - Allow editing contest-specific data
  - Show enrollment history

### Phase 6: Testing

- [ ] 6.1 Write unit tests for Candidate model
  - Test hasMany relationship with enrollments
  - Test getEnrollmentForContest() method
  - Test contests() relationship

- [ ] 6.2 Write unit tests for Enrollment model
  - Test contest() relationship
  - Test isForContest() method
  - Test status management methods

- [ ] 6.3 Write unit tests for Contest model
  - Test enrollments() relationship
  - Test isCandidateRegistered() method
  - Test getEnrollmentForCandidate() method

- [ ] 6.4 Write unit tests for EnrollmentService
  - Test createEnrollment() with valid data
  - Test createEnrollment() with duplicate registration
  - Test getCandidateEnrollments()
  - Test getEnrollment()
  - Test updateEnrollment()
  - Test deleteEnrollment()
  - Test validateEnrollmentData()

- [ ] 6.5 Write property-based tests for multiple contest registration
  - **Property 1: Multiple Contest Registration**
  - **Property 2: Enrollment Retrieval Completeness**
  - **Property 3: Contest-Specific Data Independence**
  - **Property 4: Duplicate Registration Prevention**

- [ ] 6.6 Write property-based tests for data isolation
  - **Property 6: Enrollment Update Isolation**
  - **Property 8: Enrollment Deletion Isolation**
  - **Property 10: Enrollment Status Isolation**

- [ ] 6.7 Write property-based tests for status management
  - **Property 11: Status Transition Consistency**

- [ ] 6.8 Write integration tests
  - Test complete enrollment flow for multiple contests
  - Test API endpoints with multiple enrollments
  - Test error scenarios

### Phase 7: Documentation and Cleanup

- [ ] 7.1 Update API documentation
  - Document new endpoints
  - Document contest_id parameter
  - Document error responses
  - Add examples for multiple contest registration

- [ ] 7.2 Update database documentation
  - Document new schema
  - Document unique constraints
  - Document relationships

- [ ] 7.3 Update code comments
  - Add comments to new methods
  - Document contest-specific logic
  - Add examples in docblocks

- [ ] 7.4 Clean up old code
  - Remove hasOne relationship from Candidate if not needed
  - Update any remaining single-enrollment assumptions
  - Remove deprecated methods

### Phase 8: Verification and Deployment

- [ ] 8.1 Run all tests
  - Verify all unit tests pass
  - Verify all property-based tests pass
  - Verify all integration tests pass
  - Check code coverage

- [ ] 8.2 Manual testing
  - Test registration for multiple contests
  - Test duplicate prevention
  - Test enrollment data isolation
  - Test status management
  - Test API endpoints

- [ ] 8.3 Database verification
  - Verify migration runs successfully
  - Verify data integrity
  - Verify constraints are enforced
  - Verify indexes are created

- [ ] 8.4 Deployment
  - Run migrations in staging
  - Run migrations in production
  - Verify no data loss
  - Monitor for errors

## Dependencies

- Laravel 11+
- PHP 8.2+
- MySQL 8.0+
- Existing Candidate, Contest, and Enrollment models
- Existing EnrollmentRepository

## Notes

- All changes should maintain backward compatibility where possible
- Existing enrollments should be migrated to the new structure
- Error messages should be clear and actionable
- API responses should follow existing conventions
- Tests should follow existing patterns in the codebase
