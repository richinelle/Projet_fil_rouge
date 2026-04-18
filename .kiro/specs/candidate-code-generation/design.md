# Design Document: Candidate Code Generation

## Overview

The Candidate Code Generation feature automatically generates unique candidate codes with the "SGEE" prefix when an admin approves an enrollment. Each code is unique, immutable, and serves as the official identifier for the candidate throughout the enrollment lifecycle. The system ensures atomicity and prevents duplicate codes through database-level constraints.

## Architecture

The code generation system follows a layered architecture:

1. **Event Layer**: Enrollment approval triggers the code generation workflow
2. **Service Layer**: CandidateCodeService handles code generation and validation
3. **Database Layer**: Enrollment model stores the code with uniqueness constraints
4. **Validation Layer**: Code format and uniqueness verification
5. **Display Layer**: Code presentation on enrollment forms and certificates

The system uses Laravel's database transactions to ensure atomic operations and prevent race conditions during concurrent approvals.

## Components and Interfaces

### CandidateCodeService

Responsible for generating, validating, and managing candidate codes.

```php
class CandidateCodeService
{
    /**
     * Generate a unique candidate code with SGEE prefix
     * 
     * @return string Generated candidate code
     */
    public function generateUniqueCode(): string
    
    /**
     * Assign code to enrollment during approval
     * 
     * @param Enrollment $enrollment
     * @return bool Success status
     */
    public function assignCodeToEnrollment(Enrollment $enrollment): bool
    
    /**
     * Validate candidate code format
     * 
     * @param string $code
     * @return bool
     */
    public function validateCodeFormat(string $code): bool
    
    /**
     * Check if code already exists in database
     * 
     * @param string $code
     * @return bool
     */
    private function codeExists(string $code): bool
    
    /**
     * Get next sequential number for code
     * 
     * @return int
     */
    private function getNextSequentialNumber(): int
    
    /**
     * Retrieve enrollment by candidate code
     * 
     * @param string $code
     * @return Enrollment|null
     */
    public function getEnrollmentByCode(string $code): ?Enrollment
}
```

### Code Format Specification

**Format**: `SGEE` + zero-padded sequential number

**Examples**:
- SGEE0001
- SGEE0002
- SGEE9999
- SGEE10000

**Total Length**: 8 characters (4 for prefix + 4 for zero-padded number)

**Generation Logic**:
1. Query database for highest existing sequential number
2. Increment by 1
3. Zero-pad to 4 digits
4. Prepend "SGEE" prefix
5. Verify uniqueness before assignment

### Integration Points

**With Enrollment Model**:
- Stores candidate_code in enrollments table
- Adds unique constraint on candidate_code column
- Marks code as immutable after assignment

**With Admin Approval Workflow**:
- Called during enrollment approval process
- Executes within database transaction
- Prevents approval if code generation fails

**With Display Components**:
- Code retrieved for enrollment form display
- Code included in certificate generation
- Code shown in admin enrollment details

## Data Models

### Enrollment Model Updates

```php
class Enrollment extends Model
{
    protected $fillable = [
        // ... existing fields
        'candidate_code',
    ];
    
    protected $casts = [
        // ... existing casts
    ];
    
    /**
     * Get the candidate code for this enrollment
     */
    public function getCandidateCode(): ?string
    {
        return $this->candidate_code;
    }
    
    /**
     * Check if enrollment has been assigned a code
     */
    public function hasCode(): bool
    {
        return !is_null($this->candidate_code);
    }
}
```

### Database Schema

Migration to add candidate_code column (if not already present):

```php
Schema::table('enrollments', function (Blueprint $table) {
    $table->string('candidate_code')->nullable()->unique()->after('id');
});
```

## Correctness Properties

### Property 1: Code Generated on Approval

*For any* enrollment that is approved by an admin, a candidate code SHALL be generated and assigned.

**Validates: Requirements 1.1**

### Property 2: Code Has SGEE Prefix

*For any* candidate code generated, it SHALL start with the prefix "SGEE".

**Validates: Requirements 2.1**

### Property 3: Code Is Unique

*For any* candidate code generated, it SHALL be unique across all enrollments in the system.

**Validates: Requirements 1.2, 3.1**

### Property 4: Code Is Stored in Enrollment

*For any* enrollment that is approved, the generated code SHALL be stored in the enrollment record.

**Validates: Requirements 1.3**

### Property 5: Code Cannot Be Modified

*For any* approved enrollment with an assigned code, the code SHALL not be modifiable by any user or process.

**Validates: Requirements 1.4, 5.3**

### Property 6: Code Format Is Consistent

*For any* candidate code generated, it SHALL follow the format "SGEE" + zero-padded 4-digit number.

**Validates: Requirements 2.2, 2.3, 2.4**

### Property 7: Code Is Displayed on Approved Enrollment

*For any* approved enrollment, the assigned candidate code SHALL be displayed on the enrollment form.

**Validates: Requirements 4.1, 4.2**

### Property 8: Code Persists After Status Changes

*For any* enrollment with an assigned code, the code SHALL remain unchanged when the enrollment status changes after approval.

**Validates: Requirements 5.2**

### Property 9: Concurrent Approvals Get Unique Codes

*For any* set of concurrent enrollment approvals, each enrollment SHALL receive a unique candidate code.

**Validates: Requirements 6.1, 6.2**

### Property 10: Approval Is Atomic

*For any* enrollment approval, the status update and code assignment SHALL complete as a single atomic transaction.

**Validates: Requirements 6.3, 6.4**

### Property 11: Code Can Be Retrieved by Enrollment

*For any* approved enrollment, the candidate code SHALL be retrievable from the enrollment record.

**Validates: Requirements 7.1**

### Property 12: Code Format Is Validated

*For any* candidate code retrieved, its format SHALL be validated before use.

**Validates: Requirements 7.2**

### Property 13: Unapproved Enrollment Has No Code

*For any* enrollment that has not been approved, the candidate code SHALL be null or not assigned.

**Validates: Requirements 7.3**

### Property 14: Enrollment Can Be Found by Code

*For any* valid candidate code, the system SHALL return the corresponding enrollment record.

**Validates: Requirements 7.4**

## Error Handling

The system implements comprehensive error handling:

1. **Code Generation Failure**: If code generation fails, the approval transaction is rolled back
2. **Uniqueness Violation**: If a generated code already exists, a new code is generated
3. **Database Constraint Violation**: Caught and logged; approval fails gracefully
4. **Concurrent Approval Conflicts**: Handled by database-level locking and transactions
5. **Invalid Code Format**: Validation catches and rejects malformed codes

All errors are logged with:
- Enrollment ID and candidate ID
- Error message and stack trace
- Timestamp of error
- Attempted code value

## Testing Strategy

### Unit Tests

Unit tests verify specific examples and edge cases:

1. **Code Generation**
   - Valid codes are generated with SGEE prefix
   - Sequential numbers are correctly incremented
   - Zero-padding is applied correctly
   - Codes are unique across multiple generations

2. **Code Validation**
   - Valid format codes pass validation
   - Invalid formats are rejected
   - Edge cases (very long numbers, special characters) are handled

3. **Code Assignment**
   - Code is assigned to enrollment during approval
   - Code is stored in database
   - Code cannot be modified after assignment

4. **Error Handling**
   - Duplicate codes trigger regeneration
   - Database errors are caught and logged
   - Approval fails gracefully on code generation failure

### Property-Based Tests

Property-based tests verify universal properties across many generated inputs:

1. **Code Uniqueness Property** (Property 3)
   - For all generated codes, each is unique
   - Test with 1000+ generated codes
   - Verify no duplicates exist

2. **Code Format Property** (Property 6)
   - For all generated codes, format is consistent
   - Test with various sequential numbers
   - Verify SGEE prefix and zero-padding

3. **Atomicity Property** (Property 10)
   - For all concurrent approvals, each gets unique code
   - Test with 10+ simultaneous approvals
   - Verify no race conditions

4. **Persistence Property** (Property 8)
   - For all status changes, code remains unchanged
   - Test with various status transitions
   - Verify code immutability

5. **Retrieval Property** (Property 14)
   - For all valid codes, enrollment is retrievable
   - Test with various code formats
   - Verify correct enrollment returned

**Test Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with: `Feature: candidate-code-generation, Property {number}: {property_text}`
- Use fast-check or similar library for property generation
- Mock database for deterministic testing
