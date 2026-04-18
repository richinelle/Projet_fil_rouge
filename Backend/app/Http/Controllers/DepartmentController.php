<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index()
    {
        $departments = Department::with('filieres')->get();

        return response()->json([
            'departments' => $departments,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:departments',
            'code' => 'required|string|unique:departments',
            'description' => 'nullable|string',
        ]);

        $department = Department::create($validated);

        return response()->json([
            'message' => 'Department created successfully',
            'department' => $department,
        ], 201);
    }

    public function show($id)
    {
        $department = Department::with('filieres')->find($id);

        if (! $department) {
            return response()->json(['message' => 'Department not found'], 404);
        }

        return response()->json([
            'department' => $department,
        ]);
    }

    public function update(Request $request, $id)
    {
        $department = Department::find($id);

        if (! $department) {
            return response()->json(['message' => 'Department not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'string|unique:departments,name,'.$id,
            'code' => 'string|unique:departments,code,'.$id,
            'description' => 'nullable|string',
        ]);

        $department->update($validated);

        return response()->json([
            'message' => 'Department updated successfully',
            'department' => $department,
        ]);
    }

    public function destroy($id)
    {
        $department = Department::find($id);

        if (! $department) {
            return response()->json(['message' => 'Department not found'], 404);
        }

        $department->delete();

        return response()->json(['message' => 'Department deleted successfully']);
    }

    public function getStats($id)
    {
        $department = Department::find($id);

        if (! $department) {
            return response()->json(['message' => 'Department not found'], 404);
        }

        $stats = [
            'total_candidates' => $department->candidates()->count(),
            'total_filieres' => $department->filieres()->count(),
            'total_contests' => $department->contests()->count(),
            'total_enrollments' => $department->enrollments()->count(),
        ];

        return response()->json([
            'department' => $department,
            'stats' => $stats,
        ]);
    }
}
