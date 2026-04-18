<?php

namespace App\Http\Controllers;

class SwaggerController extends Controller
{
    /**
     * Display Swagger UI
     */
    public function ui()
    {
        return view('swagger.ui');
    }

    /**
     * Get Swagger JSON specification
     */
    public function json()
    {
        $swaggerPath = storage_path('api-docs/swagger.json');

        if (! file_exists($swaggerPath)) {
            return response()->json(['error' => 'Swagger documentation not found'], 404);
        }

        $swagger = json_decode(file_get_contents($swaggerPath), true);

        return response()->json($swagger);
    }
}
