<?php

namespace Tests\Feature;

use App\Models\Candidate;
use App\Models\Enrollment;
use App\Repositories\EnrollmentRepository;
use Tests\TestCase;

class EnrollmentRepositoryPropertyTest extends TestCase
{
    protected EnrollmentRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new EnrollmentRepository;
    }

    /**
     * Property 5: Search Filters by Candidate Name
     * **Validates: Requirements 2.2**
     *
     * For any search query and set of enrollments, the list SHALL display
     */
    public function test_search_filters_by_candidate_name()
    {
        // Create test data
        $candidate1 = Candidate::factory()->create(['first_name' => 'John', 'last_name' => 'Doe']);
        $candidate2 = Candidate::factory()->create(['first_name' => 'Jane', 'last_name' => 'Smith']);
        $candidate3 = Candidate::factory()->create(['first_name' => 'Bob', 'last_name' => 'Johnson']);

        $enrollment1 = Enrollment::factory()->create(['candidate_id' => $candidate1->id, 'full_name' => 'John Doe']);
        $enrollment2 = Enrollment::factory()->create(['candidate_id' => $candidate2->id, 'full_name' => 'Jane Smith']);
        $enrollment3 = Enrollment::factory()->create(['candidate_id' => $candidate3->id, 'full_name' => 'Bob Johnson']);

        // Test search by first name
        $results = $this->repository->searchByCandidateName('John');
        $this->assertGreaterThanOrEqual(1, $results->count());
        $this->assertTrue($results->contains('id', $enrollment1->id));

        // Test search by last name
        $results = $this->repository->searchByCandidateName('Smith');
        $this->assertGreaterThanOrEqual(1, $results->count());
        $this->assertTrue($results->contains('id', $enrollment2->id));

        // Test search with no results
        $results = $this->repository->searchByCandidateName('NonExistent');
        $this->assertEquals(0, $results->count());
    }
}
