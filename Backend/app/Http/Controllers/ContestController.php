<?php

namespace App\Http\Controllers;

use App\Models\Contest;
use App\Models\ContestRegistration;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class ContestController extends Controller
{
    public function listContests()
    {
        $contests = Contest::with('examCenter', 'depositCenter', 'department', 'filiere', 'user')
            ->orderBy('contest_date', 'asc')
            ->get()
            ->map(function ($contest) {
                return [
                    'id' => $contest->id,
                    'title' => $contest->title,
                    'description' => $contest->description,
                    'requirements' => $contest->requirements,
                    'registration_start_date' => $contest->registration_start_date,
                    'registration_end_date' => $contest->registration_end_date,
                    'contest_date' => $contest->contest_date,
                    'location' => $contest->location,
                    'status' => $contest->status,
                    'registration_fee' => $contest->registration_fee,
                    'max_participants' => $contest->max_participants,
                    'current_participants' => $contest->getParticipantCount(),
                    'is_open' => $contest->isOpen(),
                    'min_age' => $contest->min_age,
                    'max_age' => $contest->max_age,
                    'organizer' => $contest->user->name,
                    'organizer_email' => $contest->user->email,
                    'organizer_phone' => $contest->user->phone,
                    'prizes' => $contest->prizes,
                    'contact_email' => $contest->contact_email,
                    'contact_phone' => $contest->contact_phone,
                    'exam_center' => $contest->examCenter ? ['id' => $contest->examCenter->id, 'name' => $contest->examCenter->name, 'location' => $contest->examCenter->location] : null,
                    'deposit_center' => $contest->depositCenter ? ['id' => $contest->depositCenter->id, 'name' => $contest->depositCenter->name, 'location' => $contest->depositCenter->location] : null,
                    'department' => $contest->department ? ['id' => $contest->department->id, 'name' => $contest->department->name] : null,
                    'filiere' => $contest->filiere ? ['id' => $contest->filiere->id, 'name' => $contest->filiere->name] : null,
                    'created_at' => $contest->created_at,
                    'updated_at' => $contest->updated_at,
                ];
            });

        return response()->json([
            'contests' => $contests,
        ]);
    }

    public function getContestDetails($contestId)
    {
        $contest = Contest::with('examCenter', 'depositCenter', 'department', 'filiere', 'user')->find($contestId);

        if (! $contest) {
            return response()->json(['message' => 'Contest not found'], 404);
        }

        return response()->json([
            'contest' => [
                'id' => $contest->id,
                'title' => $contest->title,
                'description' => $contest->description,
                'requirements' => $contest->requirements,
                'registration_start_date' => $contest->registration_start_date,
                'registration_end_date' => $contest->registration_end_date,
                'contest_date' => $contest->contest_date,
                'location' => $contest->location,
                'status' => $contest->status,
                'registration_fee' => $contest->registration_fee,
                'max_participants' => $contest->max_participants,
                'current_participants' => $contest->getParticipantCount(),
                'prizes' => $contest->prizes,
                'contact_email' => $contest->contact_email,
                'contact_phone' => $contest->contact_phone,
                'min_age' => $contest->min_age,
                'max_age' => $contest->max_age,
                'organizer' => $contest->user->name,
                'is_open' => $contest->isOpen(),
                'exam_center' => $contest->examCenter ? ['id' => $contest->examCenter->id, 'name' => $contest->examCenter->name, 'location' => $contest->examCenter->location] : null,
                'deposit_center' => $contest->depositCenter ? ['id' => $contest->depositCenter->id, 'name' => $contest->depositCenter->name, 'location' => $contest->depositCenter->location] : null,
                'department' => $contest->department ? ['id' => $contest->department->id, 'name' => $contest->department->name] : null,
                'filiere' => $contest->filiere ? ['id' => $contest->filiere->id, 'name' => $contest->filiere->name] : null,
            ],
        ]);
    }

    public function registerForContest(Request $request, $contestId)
    {
        $candidateId = auth('api')->id();

        $contest = Contest::find($contestId);

        if (! $contest) {
            return response()->json(['message' => 'Contest not found'], 404);
        }

        if (! $contest->isOpen()) {
            return response()->json(['message' => 'Contest registration is closed'], 400);
        }

        // Vérifier si déjà inscrit
        $existing = ContestRegistration::where('candidate_id', $candidateId)
            ->where('contest_id', $contestId)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Already registered for this contest'], 400);
        }

        // Vérifier le nombre de participants
        if ($contest->max_participants && $contest->getParticipantCount() >= $contest->max_participants) {
            return response()->json(['message' => 'Contest is full'], 400);
        }

        // Vérifier les critères d'âge
        $enrollment = Enrollment::where('candidate_id', $candidateId)->first();
        if ($enrollment && ($contest->min_age || $contest->max_age)) {
            $ageCheck = $contest->checkAgeRequirements($enrollment->date_of_birth);
            if (! $ageCheck['valid']) {
                return response()->json([
                    'message' => $ageCheck['message'],
                    'error_code' => 'AGE_REQUIREMENT_NOT_MET',
                ], 400);
            }
        }

        $registration = ContestRegistration::create([
            'candidate_id' => $candidateId,
            'contest_id' => $contestId,
            'status' => 'registered',
            'registered_at' => now(),
        ]);

        return response()->json([
            'message' => 'Successfully registered for contest',
            'registration' => $registration,
        ], 201);
    }

    public function getMyCandidateContests()
    {
        $candidateId = auth('api')->id();

        $registrations = ContestRegistration::where('candidate_id', $candidateId)
            ->with('contest')
            ->get()
            ->map(function ($registration) {
                return [
                    'id' => $registration->id,
                    'contest' => [
                        'id' => $registration->contest->id,
                        'title' => $registration->contest->title,
                        'description' => $registration->contest->description,
                        'contest_date' => $registration->contest->contest_date,
                        'location' => $registration->contest->location,
                        'status' => $registration->contest->status,
                    ],
                    'registration_status' => $registration->status,
                    'registered_at' => $registration->registered_at,
                ];
            });

        return response()->json([
            'contests' => $registrations,
        ]);
    }

    public function unregisterFromContest($contestId)
    {
        $candidateId = auth('api')->id();

        $registration = ContestRegistration::where('candidate_id', $candidateId)
            ->where('contest_id', $contestId)
            ->first();

        if (! $registration) {
            return response()->json(['message' => 'Registration not found'], 404);
        }

        $registration->delete();

        return response()->json(['message' => 'Successfully unregistered from contest']);
    }

    public function getAllContests()
    {
        $contests = Contest::with('examCenter', 'depositCenter', 'department', 'filiere', 'user')
            ->orderBy('contest_date', 'desc')
            ->get()
            ->map(function ($contest) {
                return [
                    'id' => $contest->id,
                    'title' => $contest->title,
                    'description' => $contest->description,
                    'contest_date' => $contest->contest_date,
                    'location' => $contest->location,
                    'status' => $contest->status,
                    'registration_fee' => $contest->registration_fee,
                    'max_participants' => $contest->max_participants,
                    'current_participants' => $contest->getParticipantCount(),
                    'organizer' => $contest->user->name,
                    'organizer_email' => $contest->user->email,
                    'exam_center' => $contest->examCenter ? $contest->examCenter->name : '-',
                    'deposit_center' => $contest->depositCenter ? $contest->depositCenter->name : '-',
                    'department' => $contest->department ? $contest->department->name : '-',
                    'filiere' => $contest->filiere ? $contest->filiere->name : '-',
                    'created_at' => $contest->created_at,
                ];
            });

        return response()->json([
            'contests' => $contests,
            'total' => $contests->count(),
        ]);
    }
}
