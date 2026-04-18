# Design Document: Multi-Contest Enrollment

## Overview

This design enables candidates to register for multiple contests with independent enrollment data for each contest. The system maintains data integrity through unique constraints and validates that candidates cannot register twice for the same contest. The architecture separates contest registration (linking candidates to contests) from enrollment data (detailed registration information specific to each contest).

## Architecture

### Current State Analysis

The system currently has:
- **Candidates**: Users who participate in contests
- **Enrollments**: Single enrollment record per candidate (hasOne relationship)
- **ContestRegistration**: Links candidates to contests with a unique constraint on (candidate_id, contest_id)
- **Contests**: Competition events

### Proposed Changes

The new architecture will:
1. Change Candidate → Enrollment relationship from hasOne to hasMany
2. Add contest_id to enrollments table to link each enrollment to a specific contest
3. Maintain the unique constraint on (candidate_id, contest_id) in enrollments table
4. Update all queries to filter enrollments by contest_id when needed
5. Preserve ContestRegistration for backward compatibility or remove if enrollments becomes the source of truth

### Data Flow

```
Candidate
  ├── hasMany Enrollments
  │   ├── Enrollment (Contest A)
  │   │   ├── contest_id: 1
  │   │   ├── department_id: 5
  │   │   ├── filiere_id: 3
  │   │   ├── exam_center_id: 2
  │   │   └── status: 'submitted'
  │   └── Enrollment (Contest B)
  │       ├── contest_id: 2
  │       ├── department_id: 6
  │       ├── filiere_id: 4
  │       ├── exam_center_id: 3
  │       └── status: 'incomplete'
  └── hasMany ContestRegistrations (for reference/backward compatibility)
```

## Components and Interfaces

### 1. Database Schema Changes

#### Migration: Add contest_id to enrollments

```sql
ALTER TABLE enrollments ADD COLUMN contest_id BIGINT UNSIGNED NULLABLE AFTER candidate_id;
ALTER TABLE enrollments ADD FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE;
ALTER TABLE enrollments ADD UNIQUE KEY unique_candidate_contest (candidate_id, contest_id);
```

#### Enrollment Table Structure (Updated)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | BIGINT | PRIMARY KEY | Unique identifier |
| candidate_id | BIGINT | FOREIGN KEY, NOT NULL | Link to candidate |
| contest_id | BIGINT | FOREIGN KEY, NOT NULL | Link to specific contest |
| full_name | VARCHAR | NOT NULL | Candidate's full name |
| date_of_birth | DATE | NOT NULL | Candidate's DOB |
| gender | VARCHAR | NOT NULL | Gender |
| nationality | VARCHAR | NOT NULL | Nationality |
| id_number | VARCHAR | UNIQUE | ID document number |
| id_type | VARCHAR | NOT NULL | Type of ID document |
| address | TEXT | NOT NULL | Residential address |
| city | VARCHAR | NOT NULL | City |
| country | VARCHAR | NOT NULL | Country |
| postal_code | VARCHAR | NOT NULL | Postal code |
| education_level | VARCHAR | NOT NULL | Education level |
| school_name | VARCHAR | NULLABLE | School/University name |
| field_of_study | VARCHAR | NULLABLE | Field of study |
| professional_experience | TEXT | NULLABLE | Work experience |
| current_job_title | VARCHAR | NULLABLE | Current job title |
| company_name | VARCHAR | NULLABLE | Company name |
| motivation_letter | TEXT | NULLABLE | Motivation letter |
| emergency_contact_name | VARCHAR | NOT NULL | Emergency contact name |
| emergency_contact_phone | VARCHAR | NOT NULL | Emergency contact phone |
| emergency_contact_relationship | VARCHAR | NOT NULL | Relationship to candidate |
| department_id | BIGINT | FOREIGN KEY, NULLABLE | Department for this contest |
| filiere_id | BIGINT | FOREIGN KEY, NULLABLE | Filière for this contest |
| exam_center_id | BIGINT | FOREIGN KEY, NULLABLE | Exam center for this contest |
| deposit_center_id | BIGINT | FOREIGN KEY, NULLABLE | Deposit center for this contest |
| status | ENUM | DEFAULT 'incomplete' | Enrollment status |
| submitted_at | TIMESTAMP | NULLABLE | Submission timestamp |
| approved_at | TIMESTAMP | NULLABLE | Approval timestamp |
| rejection_reason | TEXT | NULLABLE | Reason for rejection |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

### 2. Model Changes

#### Candidate Model

```php
class Candidate extends Authenticatable implements JWTSubject
{
    // Change from hasOne to hasMany
    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    // Get enrollments for a specific contest
    public function getEnrollmentForContest(Contest $contest): ?Enrollment
    {
        return $this->enrollments()
            ->where('contest_id', $contest->id)
            ->first();
    }

    // Get all contests the candidate is registered for
    public function contests()
    {
        return $this->hasManyThrough(
            Contest::class,
            Enrollment::class,
            'candidate_id',
            'id',
            'id',
            'contest_id'
        );
    }
}
```

#### Enrollment Model

```php
class Enrollment extends Model
{
    protected $fillable = [
        'candidate_id',
        'contest_id',
        'full_name',
        'date_of_birth',
        'gender',
        'nationality',
        'id_number',
        'id_type',
        'address',
        'city',
        'country',
        'postal_code',
        'education_level',
        'school_name',
        'field_of_study',
        'professional_experience',
        'current_job_title',
        'company_name',
        'motivation_letter',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
        'department_id',
        'filiere_id',
        'exam_center_id',
        'deposit_center_id',
        'status',
        'submitted_at',
        'approved_at',
        'rejection_reason',
    ];

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Candidate::class);
    }

    public function contest(): BelongsTo
    {
        return $this->belongsTo(Contest::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function filiere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class);
    }

    public function examCenter(): BelongsTo
    {
        return $this->belongsTo(ExamCenter::class);
    }

    public function depositCenter(): BelongsTo
    {
        return $this->belongsTo(DepositCenter::class);
    }

    // Check if this enrollment is for a specific contest
    public function isForContest(Contest $contest): bool
    {
        return $this->contest_id === $contest->id;
    }

    // Get enrollment status
    public function getStatus(): string
    {
        return $this->status;
    }

    // Update enrollment status
    public function updateStatus(string $status, ?string $reason = null): void
    {
        $this->status = $status;
        
        if ($status === 'submitted') {
            $this->submitted_at = now();
        } elseif ($status === 'approved') {
            $this->approved_at = now();
        } elseif ($status === 'rejected') {
            $this->rejection_reason = $reason;
        }
        
        $this->save();
    }
}
```

#### Contest Model

```php
class Contest extends Model
{
    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function candidates()
    {
        return $this->hasManyThrough(
            Candidate::class,
            Enrollment::class,
            'contest_id',
            'id',
            'id',
            'candidate_id'
        );
    }

    // Check if a candidate is already registered
    public function isCandidateRegistered(Candidate $candidate): bool
    {
        return $this->enrollments()
            ->where('candidate_id', $candidate->id)
            ->exists();
    }

    // Get enrollment for a specific candidate
    public function getEnrollmentForCandidate(Candidate $candidate): ?Enrollment
    {
        return $this->enrollments()
            ->where('candidate_id', $candidate->id)
            ->first();
    }
}
```

### 3. Service Layer

#### EnrollmentService

```php
class EnrollmentService
{
    /**
     * Create a new enrollment for a candidate in a contest
     * 
     * @throws DuplicateEnrollmentException if candidate already registered
     */
    public function createEnrollment(
        Candidate $candidate,
        Contest $contest,
        array $enrollmentData
    ): Enrollment {
        // Check for duplicate registration
        if ($contest->isCandidateRegistered($candidate)) {
            throw new DuplicateEnrollmentException(
                "Candidate is already registered for this contest"
            );
        }

        // Validate enrollment data
        $this->validateEnrollmentData($enrollmentData);

        // Create enrollment
        $enrollment = new Enrollment($enrollmentData);
        $enrollment->candidate_id = $candidate->id;
        $enrollment->contest_id = $contest->id;
        $enrollment->status = 'incomplete';
        $enrollment->save();

        return $enrollment;
    }

    /**
     * Get all enrollments for a candidate
     */
    public function getCandidateEnrollments(Candidate $candidate): Collection
    {
        return $candidate->enrollments()
            ->with('contest', 'department', 'filiere', 'examCenter', 'depositCenter')
            ->get();
    }

    /**
     * Get enrollment for a specific candidate-contest pair
     */
    public function getEnrollment(Candidate $candidate, Contest $contest): ?Enrollment
    {
        return $candidate->enrollments()
            ->where('contest_id', $contest->id)
            ->with('contest', 'department', 'filiere', 'examCenter', 'depositCenter')
            ->first();
    }

    /**
     * Update enrollment data
     */
    public function updateEnrollment(Enrollment $enrollment, array $data): Enrollment
    {
        $this->validateEnrollmentData($data);
        $enrollment->update($data);
        return $enrollment;
    }

    /**
     * Delete an enrollment
     */
    public function deleteEnrollment(Enrollment $enrollment): bool
    {
        return $enrollment->delete();
    }

    /**
     * Validate enrollment data
     */
    private function validateEnrollmentData(array $data): void
    {
        $validator = Validator::make($data, [
            'full_name' => 'required|string',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'nationality' => 'required|string',
            'id_number' => 'required|string|unique:enrollments',
            'id_type' => 'required|string',
            'address' => 'required|string',
            'city' => 'required|string',
            'country' => 'required|string',
            'postal_code' => 'required|string',
            'education_level' => 'required|string',
            'emergency_contact_name' => 'required|string',
            'emergency_contact_phone' => 'required|string',
            'emergency_contact_relationship' => 'required|string',
            'department_id' => 'nullable|exists:departments,id',
            'filiere_id' => 'nullable|exists:filieres,id',
            'exam_center_id' => 'nullable|exists:exam_centers,id',
            'deposit_center_id' => 'nullable|exists:deposit_centers,id',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }
}
```

## Data Models

### Enrollment Entity

```
Enrollment {
  id: UUID
  candidate_id: UUID (FK)
  contest_id: UUID (FK)
  full_name: String
  date_of_birth: Date
  gender: Enum(male, female, other)
  nationality: String
  id_number: String (Unique per enrollment)
  id_type: String
  address: String
  city: String
  country: String
  postal_code: String
  education_level: String
  school_name: String (Optional)
  field_of_study: String (Optional)
  professional_experience: String (Optional)
  current_job_title: String (Optional)
  company_name: String (Optional)
  motivation_letter: String (Optional)
  emergency_contact_name: String
  emergency_contact_phone: String
  emergency_contact_relationship: String
  department_id: UUID (FK, Optional, Contest-specific)
  filiere_id: UUID (FK, Optional, Contest-specific)
  exam_center_id: UUID (FK, Optional, Contest-specific)
  deposit_center_id: UUID (FK, Optional, Contest-specific)
  status: Enum(incomplete, completed, submitted, approved, rejected)
  submitted_at: Timestamp (Optional)
  approved_at: Timestamp (Optional)
  rejection_reason: String (Optional)
  created_at: Timestamp
  updated_at: Timestamp
  
  Constraints:
    - UNIQUE(candidate_id, contest_id)
    - FK candidate_id → candidates(id)
    - FK contest_id → contests(id)
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Multiple Contest Registration

*For any* candidate and any two different contests, when the candidate registers for both contests, the system should create two separate enrollment records, each linked to its respective contest.

**Validates: Requirements 1.1, 1.2**

### Property 2: Enrollment Retrieval Completeness

*For any* candidate with multiple contest registrations, querying the candidate's enrollments should return all enrollments across all contests without omission.

**Validates: Requirements 1.3, 1.4**

### Property 3: Contest-Specific Data Independence

*For any* candidate registered for multiple contests with different enrollment data (department, filière, exam center, deposit center), each enrollment should maintain its own data independently without cross-contamination.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

### Property 4: Duplicate Registration Prevention

*For any* candidate and contest, if the candidate is already registered for that contest, attempting to register again should be rejected with an error, and no duplicate enrollment should be created.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 5: Enrollment Data Validation

*For any* enrollment creation attempt with missing required fields, the system should reject the creation and not persist incomplete data.

**Validates: Requirements 4.1**

### Property 6: Enrollment Update Isolation

*For any* candidate with multiple enrollments, updating one enrollment should only affect that specific enrollment and not modify other enrollments for the same candidate.

**Validates: Requirements 4.2**

### Property 7: Personal Information Propagation

*For any* candidate with multiple enrollments, when the candidate's personal information (name, email, phone) is updated, all their enrollments should reflect these changes.

**Validates: Requirements 4.3**

### Property 8: Enrollment Deletion Isolation

*For any* candidate with multiple enrollments, deleting one enrollment should only remove that specific enrollment and leave other enrollments unchanged.

**Validates: Requirements 4.4**

### Property 9: Model Relationships

*For any* candidate, the hasMany relationship with enrollments should return all enrollments for that candidate. *For any* contest, the hasMany relationship with enrollments should return all enrollments for that contest.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 10: Enrollment Status Isolation

*For any* candidate with multiple enrollments in different statuses, querying the status of each enrollment should return only that enrollment's status without interference from other enrollments.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

### Property 11: Status Transition Consistency

*For any* enrollment, when transitioning to 'submitted', 'approved', or 'rejected' status, the corresponding timestamp or reason field should be set correctly and consistently.

**Validates: Requirements 6.2, 6.3, 6.4**

### Property 12: Migration Data Preservation

*For any* existing enrollment in the old structure, after migration to the new multi-contest structure, all enrollment data should be preserved and correctly linked to a contest registration.

**Validates: Requirements 7.1, 7.2, 7.3**

### Property 13: Migration Rollback Consistency

*For any* migrated data, rolling back the migration should restore the original single-enrollment structure with all data intact.

**Validates: Requirements 7.4**

## Error Handling

### Duplicate Registration Error

**Scenario**: Candidate attempts to register for a contest they're already registered for

**Response**:
```json
{
  "error": "DUPLICATE_ENROLLMENT",
  "message": "You are already registered for this contest",
  "status": 409
}
```

### Validation Error

**Scenario**: Enrollment data is missing required fields

**Response**:
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": {
    "full_name": ["The full name field is required"],
    "date_of_birth": ["The date of birth must be a valid date"]
  },
  "status": 422
}
```

### Not Found Error

**Scenario**: Enrollment or contest does not exist

**Response**:
```json
{
  "error": "NOT_FOUND",
  "message": "Enrollment not found",
  "status": 404
}
```

### Unauthorized Error

**Scenario**: User attempts to access another candidate's enrollment

**Response**:
```json
{
  "error": "UNAUTHORIZED",
  "message": "You do not have permission to access this enrollment",
  "status": 403
}
```

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and edge cases:

1. **Enrollment Creation Tests**
   - Create enrollment with valid data
   - Create enrollment with missing required fields
   - Create enrollment with invalid data types
   - Verify enrollment is linked to correct contest

2. **Duplicate Prevention Tests**
   - Attempt to create duplicate enrollment
   - Verify error is returned
   - Verify no duplicate is created

3. **Data Isolation Tests**
   - Create multiple enrollments with different data
   - Verify each enrollment maintains its own data
   - Update one enrollment and verify others are unchanged

4. **Status Management Tests**
   - Create enrollment with default status
   - Transition through valid status changes
   - Verify timestamps are set correctly

5. **Relationship Tests**
   - Verify candidate.enrollments() returns all enrollments
   - Verify contest.enrollments() returns all enrollments
   - Verify eager loading works correctly

### Property-Based Testing

Property-based tests will verify universal properties across many generated inputs:

1. **Property 1: Multiple Contest Registration**
   - Generate random candidates and contests
   - Register candidate for multiple contests
   - Verify all enrollments are created and linked correctly

2. **Property 2: Enrollment Retrieval Completeness**
   - Generate candidate with random number of contest registrations
   - Query enrollments
   - Verify count matches registrations

3. **Property 3: Contest-Specific Data Independence**
   - Generate multiple enrollments with different data
   - Verify each enrollment has correct data
   - Verify no data cross-contamination

4. **Property 4: Duplicate Registration Prevention**
   - Generate candidate and contest
   - Register candidate
   - Attempt duplicate registration
   - Verify rejection

5. **Property 6: Enrollment Update Isolation**
   - Generate candidate with multiple enrollments
   - Update one enrollment
   - Verify only that enrollment changed

6. **Property 8: Enrollment Deletion Isolation**
   - Generate candidate with multiple enrollments
   - Delete one enrollment
   - Verify only that enrollment was deleted

7. **Property 10: Enrollment Status Isolation**
   - Generate multiple enrollments with different statuses
   - Query each status
   - Verify correct status returned for each

8. **Property 11: Status Transition Consistency**
   - Generate enrollment
   - Transition through statuses
   - Verify timestamps and reasons are set correctly

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with property number and requirements reference
- Tag format: `Feature: multi-contest-enrollment, Property {N}: {property_text}`

