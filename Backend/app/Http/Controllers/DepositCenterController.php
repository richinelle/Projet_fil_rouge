<?php

namespace App\Http\Controllers;

use App\Models\DepositCenter;
use Illuminate\Http\Request;

class DepositCenterController extends Controller
{
    public function index()
    {
        $depositCenters = DepositCenter::all();
        return response()->json([
            'deposit_centers' => $depositCenters,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'address' => 'required|string',
            'city' => 'required|string',
            'country' => 'required|string',
            'contact_phone' => 'nullable|string',
            'contact_email' => 'nullable|email',
        ]);

        $depositCenter = DepositCenter::create($validated);

        return response()->json([
            'message' => 'Deposit center created successfully',
            'deposit_center' => $depositCenter,
        ], 201);
    }

    public function show($id)
    {
        $depositCenter = DepositCenter::find($id);

        if (!$depositCenter) {
            return response()->json(['message' => 'Deposit center not found'], 404);
        }

        return response()->json([
            'deposit_center' => $depositCenter,
        ]);
    }

    public function update(Request $request, $id)
    {
        $depositCenter = DepositCenter::find($id);

        if (!$depositCenter) {
            return response()->json(['message' => 'Deposit center not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'nullable|string',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'country' => 'nullable|string',
            'contact_phone' => 'nullable|string',
            'contact_email' => 'nullable|email',
        ]);

        $depositCenter->update($validated);

        return response()->json([
            'message' => 'Deposit center updated successfully',
            'deposit_center' => $depositCenter,
        ]);
    }

    public function destroy($id)
    {
        $depositCenter = DepositCenter::find($id);

        if (!$depositCenter) {
            return response()->json(['message' => 'Deposit center not found'], 404);
        }

        $depositCenter->delete();

        return response()->json([
            'message' => 'Deposit center deleted successfully',
        ]);
    }
}
