<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\VerificationCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'email' => 'required|email|unique:candidates',
            'phone' => 'required|string',
            'password' => 'required|min:6|confirmed',
        ]);

        $candidate = Candidate::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
        ]);

        $this->sendVerificationCode($candidate);

        return response()->json([
            'message' => 'Registration successful. Check your email for verification code.',
            'candidate_id' => $candidate->id,
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $candidate = Candidate::where('email', $validated['email'])->first();

        if (! $candidate || ! Hash::check($validated['password'], $candidate->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (! $candidate->email_verified) {
            return response()->json(['message' => 'Email not verified'], 403);
        }

        $token = auth('api')->login($candidate);

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'candidate' => $candidate,
        ]);
    }

    public function verifyEmail(Request $request)
    {
        $validated = $request->validate([
            'candidate_id' => 'required|exists:candidates,id',
            'code' => 'required|string',
        ]);

        $verificationCode = VerificationCode::where('candidate_id', $validated['candidate_id'])
            ->where('code', $validated['code'])
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->first();

        if (! $verificationCode) {
            return response()->json(['message' => 'Invalid or expired code'], 400);
        }

        $candidate = Candidate::find($validated['candidate_id']);
        $candidate->update(['email_verified' => true]);
        $verificationCode->update(['used' => true]);

        return response()->json(['message' => 'Email verified successfully']);
    }

    public function sendVerificationCode(Candidate $candidate)
    {
        $code = Str::random(6);

        VerificationCode::create([
            'candidate_id' => $candidate->id,
            'code' => $code,
            'expires_at' => now()->addMinutes(15),
        ]);

        Mail::raw("Your verification code is: $code", function ($message) use ($candidate) {
            $message->to($candidate->email)
                ->subject('Email Verification Code');
        });
    }

    public function logout()
    {
        auth('api')->logout();

        return response()->json(['message' => 'Logout successful']);
    }

    public function updateProfile(Request $request)
    {
        $candidate = auth('api')->user();

        $validated = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'phone' => 'required|string',
        ]);

        $candidate->update($validated);

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'candidate' => $candidate,
        ]);
    }

    public function changePassword(Request $request)
    {
        $candidate = auth('api')->user();

        $validated = $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:6|confirmed',
        ]);

        if (! Hash::check($validated['current_password'], $candidate->password)) {
            return response()->json(['message' => 'Mot de passe actuel incorrect'], 400);
        }

        $candidate->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return response()->json(['message' => 'Mot de passe modifié avec succès']);
    }
}
