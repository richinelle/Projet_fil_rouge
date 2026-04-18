# Tasks: Candidate Code Generation

## Overview

Implementation tasks for the Candidate Code Generation feature. Each task builds upon the previous one to create a complete, tested system for generating and managing unique SGEE-prefixed candidate codes.

## Task List

- [ ] 1. Create CandidateCodeService class
  - [ ] 1.1 Implement generateUniqueCode() method
  - [ ] 1.2 Implement codeExists() method
  - [ ] 1.3 Implement getNextSequentialNumber() method
  - [ ] 1.4 Implement validateCodeFormat() method

- [ ] 2. Add candidate_code column to enrollments table
  - [ ] 2.1 Create migration to add candidate_code column
  - [ ] 2.2 Add unique constraint on candidate_code
  - [ ] 2.3 Run migration

- [ ] 3. Update Enrollment model
  - [ ] 3.1 Add candidate_code to fillable array
  - [ ] 3.2 Add getCandidateCode() method
  - [ ] 3.3 Add hasCode() method

- [ ] 4. Integrate code generation with approval workflow
  - [ ] 4.1 Update EnrollmentController approval method
  - [ ] 4.2 Call CandidateCodeService during approval
  - [ ] 4.3 Wrap approval in database transaction
  - [ ] 4.4 Handle code generation failures

- [ ] 5. Display candidate code on enrollment form
  - [ ] 5.1 Update EnrollmentManagement component to show code
  - [ ] 5.2 Update enrollment details view to display code
  - [ ] 5.3 Add code to enrollment certificate

- [ ] 6. Add code retrieval and search functionality
  - [ ] 6.1 Implement getEnrollmentByCode() method
  - [ ] 6.2 Add search endpoint for code lookup
  - [ ] 6.3 Add validation for code format in search

- [ ] 7. Write unit tests for CandidateCodeService
  - [ ] 7.1 Test code generation with SGEE prefix
  - [ ] 7.2 Test code uniqueness
  - [ ] 7.3 Test code format validation
  - [ ] 7.4 Test sequential number generation

- [ ] 8. Write property-based tests
  - [ ] 8.1 Property test: Code uniqueness across 1000+ generations
  - [ ] 8.2 Property test: Code format consistency
  - [ ] 8.3 Property test: Concurrent approval atomicity
  - [ ] 8.4 Property test: Code persistence after status changes

- [ ] 9. Integration testing
  - [ ] 9.1 Test full approval workflow with code generation
  - [ ] 9.2 Test code display on enrollment form
  - [ ] 9.3 Test code retrieval by enrollment
  - [ ] 9.4 Test concurrent approvals

- [ ] 10. Documentation and deployment
  - [ ] 10.1 Document code generation process
  - [ ] 10.2 Update API documentation
  - [ ] 10.3 Create user guide for admins
  - [ ] 10.4 Deploy to production
