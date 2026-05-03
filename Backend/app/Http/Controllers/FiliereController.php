<?php

namespace App\Http\Controllers;

use App\Models\Filiere;
use App\Models\Department;
use Illuminate\Http\Request;

class FiliereController extends Controller
{
    public function index()
    {
        $filieres = Filiere::with('department')->get();

        return response()->json([
            'filieres' => $filieres,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'name' => 'required|string',
            'code' => 'required|string|unique:filieres',
            'description' => 'nullable|string',
        ]);

        $filiere = Filiere::create($validated);

        return response()->json([
            'message' => 'Filière created successfully',
            'filiere' => $filiere->load('department'),
        ], 201);
    }

    public function show($id)
    {
        $filiere = Filiere::with('department')->find($id);

        if (!$filiere) {
            return response()->json(['message' => 'Filière not found'], 404);
        }

        return response()->json([
            'filiere' => $filiere,
        ]);
    }

    public function update(Request $request, $id)
    {
        $filiere = Filiere::find($id);

        if (!$filiere) {
            return response()->json(['message' => 'Filière not found'], 404);
        }

        $validated = $request->validate([
            'department_id' => 'exists:departments,id',
            'name' => 'string',
            'code' => 'string|unique:filieres,code,' . $id,
            'description' => 'nullable|string',
        ]);

        $filiere->update($validated);

        return response()->json([
            'message' => 'Filière updated successfully',
            'filiere' => $filiere->load('department'),
        ]);
    }

    public function destroy($id)
    {
        $filiere = Filiere::find($id);

        if (!$filiere) {
            return response()->json(['message' => 'Filière not found'], 404);
        }

        $filiere->delete();

        return response()->json(['message' => 'Filière deleted successfully']);
    }

    public function getByDepartment($departmentId)
    {
        $department = Department::find($departmentId);

        if (!$department) {
            return response()->json(['message' => 'Department not found'], 404);
        }

        $filieres = $department->filieres()->get();

        return response()->json([
            'department' => $department,
            'filieres' => $filieres,
        ]);
    }

    public function getStats($id)
    {
        $filiere = Filiere::find($id);

        if (!$filiere) {
            return response()->json(['message' => 'Filière not found'], 404);
        }

        $stats = [
            'total_candidates' => $filiere->candidates()->count(),
            'total_contests' => $filiere->contests()->count(),
            'total_enrollments' => $filiere->enrollments()->count(),
        ];

        return response()->json([
            'filiere' => $filiere->load('department'),
            'stats' => $stats,
        ]);
    }
}
