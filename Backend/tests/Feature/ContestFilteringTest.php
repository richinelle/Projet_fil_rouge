<?php

namespace Tests\Feature;

use App\Models\Candidate;
use App\Models\Contest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContestFilteringTest extends TestCase
{
    use RefreshDatabase;

    protected $candidate;

    protected $token;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a manager user
        $manager = User::factory()->create(['role' => 'contest_manager']);

        // Create a candidate
        $this->candidate = Candidate::factory()->create();

        // Generate token for candidate
        $this->token = auth('api')->login($this->candidate);
    }

    public function test_contest_is_open_before_registration_end_date()
    {
        $manager = User::where('role', 'contest_manager')->first();

        // Create a contest that ends tomorrow
        $contest = Contest::create([
            'user_id' => $manager->id,
            'title' => 'Open Contest',
            'description' => 'This contest is open',
            'registration_start_date' => now()->subDays(10),
            'registration_end_date' => now()->addDays(1), // Tomorrow
            'contest_date' => now()->addDays(10),
            'status' => 'open',
            'registration_fee' => 5000,
        ]);

        // Verify isOpen() returns true
        $this->assertTrue($contest->isOpen());
    }

    public function test_contest_is_closed_after_registration_end_date()
    {
        $manager = User::where('role', 'contest_manager')->first();

        // Create a contest that ended yesterday
        $contest = Contest::create([
            'user_id' => $manager->id,
            'title' => 'Closed Contest',
            'description' => 'This contest is closed',
            'registration_start_date' => now()->subDays(10),
            'registration_end_date' => now()->subDays(1), // Yesterday
            'contest_date' => now()->addDays(5),
            'status' => 'open',
            'registration_fee' => 5000,
        ]);

        // Verify isOpen() returns false
        $this->assertFalse($contest->isOpen());
    }

    public function test_contest_is_open_before_start_date()
    {
        $manager = User::where('role', 'contest_manager')->first();

        // Create a contest that starts tomorrow but ends in 10 days
        $contest = Contest::create([
            'user_id' => $manager->id,
            'title' => 'Future Contest',
            'description' => 'This contest starts tomorrow',
            'registration_start_date' => now()->addDays(1), // Tomorrow
            'registration_end_date' => now()->addDays(10), // In 10 days
            'contest_date' => now()->addDays(15),
            'status' => 'upcoming',
            'registration_fee' => 5000,
        ]);

        // Verify isOpen() returns true (because end date is not passed)
        $this->assertTrue($contest->isOpen());
    }

    public function test_contest_is_closed_with_closed_status()
    {
        $manager = User::where('role', 'contest_manager')->first();

        // Create a contest with closed status
        $contest = Contest::create([
            'user_id' => $manager->id,
            'title' => 'Closed Contest',
            'description' => 'This contest is closed',
            'registration_start_date' => now()->subDays(10),
            'registration_end_date' => now()->addDays(10),
            'contest_date' => now()->addDays(15),
            'status' => 'closed',
            'registration_fee' => 5000,
        ]);

        // Verify isOpen() returns false
        $this->assertFalse($contest->isOpen());
    }

    public function test_contests_are_filtered_correctly_in_api()
    {
        $manager = User::where('role', 'contest_manager')->first();

        // Create an open contest
        $openContest = Contest::create([
            'user_id' => $manager->id,
            'title' => 'Open Contest',
            'description' => 'This contest is open',
            'registration_start_date' => now()->subDays(1),
            'registration_end_date' => now()->addDays(1),
            'contest_date' => now()->addDays(10),
            'status' => 'upcoming',
            'registration_fee' => 5000,
        ]);

        // Create a closed contest
        $closedContest = Contest::create([
            'user_id' => $manager->id,
            'title' => 'Closed Contest',
            'description' => 'This contest is closed',
            'registration_start_date' => now()->subDays(10),
            'registration_end_date' => now()->subDays(1),
            'contest_date' => now()->addDays(5),
            'status' => 'upcoming',
            'registration_fee' => 5000,
        ]);

        // Fetch contests
        $response = $this->getJson('/api/contests', [
            'Authorization' => "Bearer {$this->token}",
        ]);

        $response->assertStatus(200);
        $contests = $response->json('contests');

        // Find our contests in the response
        $openContestData = collect($contests)->firstWhere('id', $openContest->id);
        $closedContestData = collect($contests)->firstWhere('id', $closedContest->id);

        // Verify open contest has is_open = true
        $this->assertTrue($openContestData['is_open']);

        // Verify closed contest has is_open = false
        $this->assertFalse($closedContestData['is_open']);
    }
}
