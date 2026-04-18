<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test: User can login with valid credentials
     */
    public function test_user_can_login_with_valid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'token',
                'user' => ['id', 'name', 'email', 'role'],
            ])
            ->assertJson([
                'message' => 'Login successful',
                'user' => [
                    'id' => $user->id,
                    'email' => 'test@example.com',
                ],
            ]);
    }

    /**
     * Test: User cannot login with invalid email
     */
    public function test_user_cannot_login_with_invalid_email()
    {
        $response = $this->postJson('/api/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Invalid credentials']);
    }

    /**
     * Test: User cannot login with wrong password
     */
    public function test_user_cannot_login_with_wrong_password()
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('correctpassword'),
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Invalid credentials']);
    }

    /**
     * Test: Inactive user cannot login
     */
    public function test_inactive_user_cannot_login()
    {
        User::factory()->create([
            'email' => 'inactive@example.com',
            'password' => Hash::make('password123'),
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'inactive@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJson(['message' => 'Account is inactive']);
    }

    /**
     * Test: Login requires email field
     */
    public function test_login_requires_email()
    {
        $response = $this->postJson('/api/login', [
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    /**
     * Test: Login requires password field
     */
    public function test_login_requires_password()
    {
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('password');
    }

    /**
     * Test: User can logout
     */
    public function test_user_can_logout()
    {
        $user = User::factory()->create([
            'is_active' => true,
        ]);

        $token = auth('api-users')->login($user);

        $response = $this->withHeaders([
            'Authorization' => "Bearer $token",
        ])->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Logout successful']);
    }

    /**
     * Test: User can get profile
     */
    public function test_user_can_get_profile()
    {
        $user = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '+237123456789',
            'organization' => 'ACME Corp',
            'bio' => 'Test bio',
            'is_active' => true,
        ]);

        $token = auth('api-users')->login($user);

        $response = $this->withHeaders([
            'Authorization' => "Bearer $token",
        ])->getJson('/api/profile');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email', 'role', 'phone', 'organization', 'bio'],
            ])
            ->assertJson([
                'user' => [
                    'id' => $user->id,
                    'name' => 'John Doe',
                    'email' => 'john@example.com',
                    'phone' => '+237123456789',
                    'organization' => 'ACME Corp',
                    'bio' => 'Test bio',
                ],
            ]);
    }

    /**
     * Test: Unauthenticated user cannot get profile
     */
    public function test_unauthenticated_user_cannot_get_profile()
    {
        $response = $this->getJson('/api/profile');

        $response->assertStatus(401);
    }

    /**
     * Test: User can update profile
     */
    public function test_user_can_update_profile()
    {
        $user = User::factory()->create([
            'is_active' => true,
        ]);

        $token = auth('api-users')->login($user);

        $response = $this->withHeaders([
            'Authorization' => "Bearer $token",
        ])->putJson('/api/profile', [
            'name' => 'Updated Name',
            'phone' => '+237987654321',
            'organization' => 'New Org',
            'bio' => 'Updated bio',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Profil mis à jour avec succès',
                'user' => [
                    'name' => 'Updated Name',
                    'phone' => '+237987654321',
                    'organization' => 'New Org',
                    'bio' => 'Updated bio',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'phone' => '+237987654321',
        ]);
    }

    /**
     * Test: User can change password
     */
    public function test_user_can_change_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword'),
            'is_active' => true,
        ]);

        $token = auth('api-users')->login($user);

        $response = $this->withHeaders([
            'Authorization' => "Bearer $token",
        ])->postJson('/api/change-password', [
            'current_password' => 'oldpassword',
            'new_password' => 'newpassword123',
            'new_password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Mot de passe modifié avec succès']);

        $user->refresh();
        $this->assertTrue(Hash::check('newpassword123', $user->password));
    }

    /**
     * Test: User cannot change password with wrong current password
     */
    public function test_user_cannot_change_password_with_wrong_current_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('correctpassword'),
            'is_active' => true,
        ]);

        $token = auth('api-users')->login($user);

        $response = $this->withHeaders([
            'Authorization' => "Bearer $token",
        ])->postJson('/api/change-password', [
            'current_password' => 'wrongpassword',
            'new_password' => 'newpassword123',
            'new_password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(400)
            ->assertJson(['message' => 'Mot de passe actuel incorrect']);
    }

    /**
     * Test: Password change requires confirmation
     */
    public function test_password_change_requires_confirmation()
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword'),
            'is_active' => true,
        ]);

        $token = auth('api-users')->login($user);

        $response = $this->withHeaders([
            'Authorization' => "Bearer $token",
        ])->postJson('/api/change-password', [
            'current_password' => 'oldpassword',
            'new_password' => 'newpassword123',
            'new_password_confirmation' => 'differentpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('new_password');
    }

    /**
     * Test: JWT token is valid
     */
    public function test_jwt_token_is_valid()
    {
        $user = User::factory()->create([
            'is_active' => true,
        ]);

        $token = auth('api-users')->login($user);

        $this->assertNotNull($token);
        $this->assertIsString($token);
    }

    /**
     * Test: Invalid token returns 401
     */
    public function test_invalid_token_returns_401()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer invalid.token.here',
        ])->getJson('/api/profile');

        $response->assertStatus(401);
    }
}
