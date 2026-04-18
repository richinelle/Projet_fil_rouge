<?php

use App\Http\Controllers\SwaggerController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Swagger documentation routes
Route::get('/docs', [SwaggerController::class, 'ui'])->name('swagger.ui');
Route::get('/api/docs', [SwaggerController::class, 'ui'])->name('swagger.ui.api');
Route::get('/api/docs/json', [SwaggerController::class, 'json'])->name('swagger.json');

Route::get('/metrics', function () {
    return response(
        "# HELP app_up Application status\n".
        "# TYPE app_up gauge\n".
        "app_up 1\n",
        200
    )->header('Content-Type', 'text/plain; version=0.0.4');
});
