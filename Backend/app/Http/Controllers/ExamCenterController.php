<?php

namespace App\Http\Controllers;

use App\Models\ExamCenter;
use Illuminate\Http\Request;

class ExamCenterController extends Controller
{
    public function index()
    {
        $examCenters = ExamCenter::all();
        return response()->json([
            'exam_centers' => $examCenters,
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
            'capacity' => 'nullable|integer',
        ]);

        $examCenter = ExamCenter::create($validated);

        return response()->json([
            'message' => 'Exam center created successfully',
            'exam_center' => $examCenter,
        ], 201);
    }

    public function show($id)
    {
        $examCenter = ExamCenter::find($id);

        if (!$examCenter) {
            return response()->json(['message' => 'Exam center not found'], 404);
        }

        return response()->json([
            'exam_center' => $examCenter,
        ]);
    }

    public function update(Request $request, $id)
    {
        $examCenter = ExamCenter::find($id);

        if (!$examCenter) {
            return response()->json(['message' => 'Exam center not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'nullable|string',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'country' => 'nullable|string',
            'contact_phone' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'capacity' => 'nullable|integer',
        ]);

        $examCenter->update($validated);

        return response()->json([
            'message' => 'Exam center updated successfully',
            'exam_center' => $examCenter,
        ]);
    }

    public function destroy($id)
    {
        $examCenter = ExamCenter::find($id);

        if (!$examCenter) {
            return response()->json(['message' => 'Exam center not found'], 404);
        }

        $examCenter->delete();

        return response()->json([
            'message' => 'Exam center deleted successfully',
        ]);
    }
}
