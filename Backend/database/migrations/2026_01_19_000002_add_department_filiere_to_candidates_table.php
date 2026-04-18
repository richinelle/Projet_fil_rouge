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
        Schema::table('candidates', function (Blueprint $table) {
            $table->unsignedBigInteger('department_id')->nullable()->after('email');
            $table->unsignedBigInteger('filiere_id')->nullable()->after('department_id');

            $table->foreign('department_id')->references('id')->on('departments')->onDelete('set null');
            $table->foreign('filiere_id')->references('id')->on('filieres')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropForeign(['filiere_id']);
            $table->dropColumn(['department_id', 'filiere_id']);
        });
    }
};
