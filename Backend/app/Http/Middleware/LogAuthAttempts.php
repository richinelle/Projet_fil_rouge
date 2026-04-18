<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class LogAuthAttempts
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // Log authentication attempts for API routes
        if ($request->is('api/*')) {
            \Log::info('[LogAuthAttempts] API Request', [
                'method' => $request->method(),
                'path' => $request->path(),
                'authHeader' => $request->header('Authorization') ? 'present' : 'missing',
                'authHeaderValue' => substr($request->header('Authorization') ?? '', 0, 20).'...',
            ]);
        }

        $response = $next($request);

        // Log response status
        if ($request->is('api/*') && $response->getStatusCode() === 401) {
            \Log::warning('[LogAuthAttempts] Unauthenticated response', [
                'method' => $request->method(),
                'path' => $request->path(),
                'authHeader' => $request->header('Authorization') ? 'present' : 'missing',
            ]);
        }

        return $response;
    }
}
