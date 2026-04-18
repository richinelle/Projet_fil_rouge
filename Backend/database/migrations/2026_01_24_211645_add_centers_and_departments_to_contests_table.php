<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('contests', function (Blueprint $table) {
            $table->foreignId('exam_center_id')->nullable()->constrained('exam_centers')->onDelete('set null');
            $table->foreignId('deposit_center_id')->nullable()->constrained('deposit_centers')->onDelete('set null');
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->foreignId('filiere_id')->nullable()->constrained('filieres')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contests', function (Blueprint $table) {
            $table->dropForeignIdFor('exam_center_id');
            $table->dropForeignIdFor('deposit_center_id');
            $table->dropForeignIdFor('department_id');
            $table->dropForeignIdFor('filiere_id');
        });
    }
};
