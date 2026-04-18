<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Candidate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserManagementController extends Controller
{
    /**
     * Get all users (admin and managers)
     */
    public function getAllUsers()
    {
        $users = User::select('id', 'name', 'email', 'role', 'phone', 'organization', 'is_active', 'created_at', 'updated_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'users' => $users,
            'total' => $users->count(),
        ]);
    }

    /**
     * Get all candidates
     */
    public function getAllCandidates()
    {
        $candidates = Candidate::select(
            'id',
            'first_name',
            'last_name',
            'email',
            'phone',
            'email_verified',
            'created_at',
            'updated_at'
        )
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($candidate) {
                return [
                    'id' => $candidate->id,
                    'name' => $candidate->first_name . ' ' . $candidate->last_name,
                    'first_name' => $candidate->first_name,
                    'last_name' => $candidate->last_name,
                    'email' => $candidate->email,
                    'phone' => $candidate->phone,
                    'email_verified' => $candidate->email_verified,
                    'status' => $candidate->email_verified ? 'Vérifié' : 'En attente',
                    'created_at' => $candidate->created_at,
                    'updated_at' => $candidate->updated_at,
                ];
            });

        return response()->json([
            'candidates' => $candidates,
            'total' => $candidates->count(),
        ]);
    }

    /**
     * Get user statistics
     */
    public function getUserStatistics()
    {
        $totalAdmins = User::where('role', 'admin')->count();
        $totalManagers = User::where('role', 'contest_manager')->count();
        $totalCandidates = Candidate::count();
        $verifiedCandidates = Candidate::where('email_verified', true)->count();
        $unverifiedCandidates = Candidate::where('email_verified', false)->count();

        $recentCandidates = Candidate::orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($candidate) {
                return [
                    'id' => $candidate->id,
                    'name' => $candidate->first_name . ' ' . $candidate->last_name,
                    'email' => $candidate->email,
                    'created_at' => $candidate->created_at,
                ];
            });

        $recentUsers = User::orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'created_at' => $user->created_at,
                ];
            });

        return response()->json([
            'statistics' => [
                'total_admins' => $totalAdmins,
                'total_managers' => $totalManagers,
                'total_candidates' => $totalCandidates,
                'verified_candidates' => $verifiedCandidates,
                'unverified_candidates' => $unverifiedCandidates,
            ],
            'recent_candidates' => $recentCandidates,
            'recent_users' => $recentUsers,
        ]);
    }

    /**
     * Create a new admin or manager user
     */
    public function createUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,contest_manager',
            'phone' => 'nullable|string',
            'organization' => 'nullable|string',
            'bio' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'phone' => $validated['phone'] ?? null,
            'organization' => $validated['organization'] ?? null,
            'bio' => $validated['bio'] ?? null,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,
        ], 201);
    }

    /**
     * Update user information
     */
    public function updateUser(Request $request, $userId)
    {
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'string',
            'email' => 'email|unique:users,email,' . $userId,
            'phone' => 'nullable|string',
            'organization' => 'nullable|string',
            'bio' => 'nullable|string',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user,
        ]);
    }

    /**
     * Change user role
     */
    public function changeUserRole(Request $request, $userId)
    {
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validated = $request->validate([
            'role' => 'required|in:admin,contest_manager',
        ]);

        $user->update(['role' => $validated['role']]);

        return response()->json([
            'message' => 'User role updated successfully',
            'user' => $user,
        ]);
    }

    /**
     * Toggle user active status
     */
    public function toggleUserStatus($userId)
    {
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'message' => 'User status updated successfully',
            'user' => $user,
        ]);
    }

    /**
     * Delete a user
     */
    public function deleteUser($userId)
    {
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Prevent deleting the last admin
        if ($user->role === 'admin' && User::where('role', 'admin')->count() === 1) {
            return response()->json(['message' => 'Cannot delete the last admin user'], 400);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Get candidate details
     */
    public function getCandidateDetails($candidateId)
    {
        $candidate = Candidate::find($candidateId);

        if (!$candidate) {
            return response()->json(['message' => 'Candidate not found'], 404);
        }

        return response()->json([
            'candidate' => [
                'id' => $candidate->id,
                'first_name' => $candidate->first_name,
                'last_name' => $candidate->last_name,
                'email' => $candidate->email,
                'phone' => $candidate->phone,
                'email_verified' => $candidate->email_verified,
                'created_at' => $candidate->created_at,
                'updated_at' => $candidate->updated_at,
            ],
        ]);
    }

    /**
     * Search users and candidates
     */
    public function searchUsers(Request $request)
    {
        $query = $request->query('q', '');

        if (strlen($query) < 2) {
            return response()->json([
                'users' => [],
                'candidates' => [],
            ]);
        }

        $users = User::where('name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->limit(10)
            ->get();

        $candidates = Candidate::where('first_name', 'like', "%{$query}%")
            ->orWhere('last_name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->limit(10)
            ->get()
            ->map(function ($candidate) {
                return [
                    'id' => $candidate->id,
                    'name' => $candidate->first_name . ' ' . $candidate->last_name,
                    'email' => $candidate->email,
                    'type' => 'candidate',
                ];
            });

        return response()->json([
            'users' => $users,
            'candidates' => $candidates,
        ]);
    }

    /**
     * Get activity log (recent registrations)
     */
    public function getActivityLog()
    {
        $candidateRegistrations = Candidate::orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($candidate) {
                return [
                    'id' => $candidate->id,
                    'type' => 'candidate_registration',
                    'user_name' => $candidate->first_name . ' ' . $candidate->last_name,
                    'user_email' => $candidate->email,
                    'action' => 'S\'est inscrit',
                    'timestamp' => $candidate->created_at,
                ];
            });

        $userCreations = User::orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'type' => 'user_creation',
                    'user_name' => $user->name,
                    'user_email' => $user->email,
                    'action' => 'Compte ' . $user->role . ' créé',
                    'timestamp' => $user->created_at,
                ];
            });

        $activities = collect($candidateRegistrations)
            ->merge($userCreations)
            ->sortByDesc('timestamp')
            ->values()
            ->take(30);

        return response()->json([
            'activities' => $activities,
        ]);
    }
}
