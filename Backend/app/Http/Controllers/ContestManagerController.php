<?php

namespace App\Http\Controllers;

use App\Models\Contest;
use App\Models\ContestRegistration;
use Illuminate\Http\Request;

class ContestManagerController extends Controller
{
    // Définition des constantes pour éviter la duplication des "literals" (SonarCloud)
    private const MSG_NOT_FOUND = 'Contest not found';
    private const MSG_UNAUTHORIZED = 'Unauthorized';

    public function createContest(Request $request)
    {
        $userId = auth('api-users')->id();

        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'requirements' => 'nullable|string',
            'max_participants' => 'nullable|integer|min:1',
            'registration_fee' => 'required|numeric|min:0',
            'registration_start_date' => 'required|date',
            'registration_end_date' => 'required|date|after:registration_start_date',
            'contest_date' => 'required|date|after:registration_end_date',
            'location' => 'nullable|string',
            'prizes' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string',
            'exam_center_id' => 'nullable|exists:exam_centers,id',
            'deposit_center_id' => 'nullable|exists:deposit_centers,id',
            'department_id' => 'nullable|exists:departments,id',
            'filiere_id' => 'nullable|exists:filieres,id',
        ]);

        $contest = Contest::create(array_merge($validated, [
            'user_id' => $userId,
            'status' => 'upcoming',
        ]));

        return response()->json([
            'message' => 'Contest created successfully',
            'contest' => $contest->load('examCenter', 'depositCenter', 'department', 'filiere'),
        ], 201);
    }

    public function updateContest(Request $request, $contestId)
    {
        $userId = auth('api-users')->id();
        $contest = Contest::find($contestId);

        if (!$contest) {
            return response()->json(['message' => self::MSG_NOT_FOUND], 404);
        }

        if ($contest->user_id !== $userId) {
            return response()->json(['message' => self::MSG_UNAUTHORIZED], 403);
        }

        $validated = $request->validate([
            'title' => 'string',
            'description' => 'string',
            'requirements' => 'nullable|string',
            'max_participants' => 'nullable|integer|min:1',
            'registration_fee' => 'numeric|min:0',
            'registration_start_date' => 'date',
            'registration_end_date' => 'date',
            'contest_date' => 'date',
            'location' => 'nullable|string',
            'status' => 'in:upcoming,open,closed,ongoing,completed',
            'prizes' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string',
            'exam_center_id' => 'nullable|exists:exam_centers,id',
            'deposit_center_id' => 'nullable|exists:deposit_centers,id',
            'department_id' => 'nullable|exists:departments,id',
            'filiere_id' => 'nullable|exists:filieres,id',
        ]);

        $contest->update($validated);

        return response()->json([
            'message' => 'Contest updated successfully',
            'contest' => $contest->load('examCenter', 'depositCenter', 'department', 'filiere'),
        ]);
    }

    public function deleteContest($contestId)
    {
        $userId = auth('api-users')->id();
        $contest = Contest::find($contestId);

        if (!$contest) {
            return response()->json(['message' => self::MSG_NOT_FOUND], 404);
        }

        if ($contest->user_id !== $userId) {
            return response()->json(['message' => self::MSG_UNAUTHORIZED], 403);
        }

        $contest->delete();

        return response()->json(['message' => 'Contest deleted successfully']);
    }

    // ... (index et autres méthodes)

    public function getContestParticipants($contestId)
    {
        $userId = auth('api-users')->id();
        $contest = Contest::find($contestId);

        if (!$contest) {
            return response()->json(['message' => self::MSG_NOT_FOUND], 404);
        }

        if ($contest->user_id !== $userId) {
            return response()->json(['message' => self::MSG_UNAUTHORIZED], 403);
        }

        $registrations = ContestRegistration::where('contest_id', $contestId)
            ->with('candidate')
            ->get()
            ->map(function ($registration) {
                return [
                    'id' => $registration->id,
                    'candidate' => [
                        'id' => $registration->candidate->id,
                        'first_name' => $registration->candidate->first_name,
                        'last_name' => $registration->candidate->last_name,
                        'email' => $registration->candidate->email,
                        'phone' => $registration->candidate->phone,
                    ],
                    'status' => $registration->status,
                    'registered_at' => $registration->registered_at,
                ];
            });

        return response()->json([
            'participants' => $registrations,
        ]);
    }

    public function updateParticipantStatus(Request $request, $registrationId)
    {
        $userId = auth('api-users')->id();
        $registration = ContestRegistration::with('contest')->find($registrationId);

        if (!$registration) {
            return response()->json(['message' => 'Registration not found'], 404);
        }

        if ($registration->contest->user_id !== $userId) {
            return response()->json(['message' => self::MSG_UNAUTHORIZED], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:registered,confirmed,participated,disqualified',
        ]);

        $registration->update($validated);

        return response()->json([
            'message' => 'Participant status updated',
            'registration' => $registration,
        ]);
    }
}
