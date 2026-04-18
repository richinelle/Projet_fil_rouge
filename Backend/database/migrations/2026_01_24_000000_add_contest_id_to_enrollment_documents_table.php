<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Vérifier si la colonne n'existe pas avant de l'ajouter
        if (Schema::hasTable('enrollment_documents') && !Schema::hasColumn('enrollment_documents', 'contest_id')) {
            Schema::table('enrollment_documents', function (Blueprint $table) {
                $table->foreignId('contest_id')->nullable()->constrained('contests')->onDelete('set null')->after('document_type');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('enrollment_documents') && Schema::hasColumn('enrollment_documents', 'contest_id')) {
            Schema::table('enrollment_documents', function (Blueprint $table) {
                $table->dropForeign(['contest_id']);
                $table->dropColumn('contest_id');
            });
        }
    }
};
