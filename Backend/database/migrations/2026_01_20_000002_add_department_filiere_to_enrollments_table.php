<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->foreignId('filiere_id')->nullable()->constrained('filieres')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropForeignIdFor('Department');
            $table->dropForeignIdFor('Filiere');
            $table->dropColumn(['department_id', 'filiere_id']);
        });
    }
};
