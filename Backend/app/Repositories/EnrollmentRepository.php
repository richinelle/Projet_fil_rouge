<?php

namespace App\Repositories;

use App\Models\Enrollment;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class EnrollmentRepository
{
    /**
     * Get enrollments with filters and pagination
     */
    public function getFiltered(
        array $filters,
        int $page = 1,
        int $perPage = 20,
        string $sortBy = 'created_at',
        string $sortOrder = 'desc'
    ): LengthAwarePaginator {
        $query = Enrollment::query();

        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('candidate', function ($q) use ($search) {
                $q->where('first_name', 'ilike', "%{$search}%")
                  ->orWhere('last_name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        // Apply status filter
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Apply department filter
        if (!empty($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        // Apply filière filter
        if (!empty($filters['filiere_id'])) {
            $query->where('filiere_id', $filters['filiere_id']);
        }

        // Apply sorting
        $query->orderBy($sortBy, $sortOrder);

        // Apply pagination
        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get enrollments by status
     */
    public function getByStatus(string $status): Collection
    {
        return Enrollment::where('status', $status)->get();
    }

    /**
     * Get recent pending enrollments
     */
    public function getRecentPending(int $limit = 10): Collection
    {
        return Enrollment::where('status', 'pending')
            ->orderBy('submitted_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get enrollment by ID with all relationships
     */
    public function getById(int $id): ?Enrollment
    {
        return Enrollment::with([
            'candidate',
            'department',
            'filiere',
            'documents',
            'auditLogs',
            'approvalHistory'
        ])->find($id);
    }

    /**
     * Get status counts
     */
    public function getStatusCounts(): array
    {
        $counts = Enrollment::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return [
            'pending' => $counts['pending'] ?? 0,
            'approved' => $counts['approved'] ?? 0,
            'rejected' => $counts['rejected'] ?? 0,
        ];
    }

    /**
     * Search enrollments by candidate name
     */
    public function searchByCandidateName(string $search): Collection
    {
        return Enrollment::whereHas('candidate', function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%");
        })->get();
    }
}
