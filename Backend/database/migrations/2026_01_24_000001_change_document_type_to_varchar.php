<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Changer le type de colonne de ENUM à VARCHAR
        if (Schema::hasTable('enrollment_documents')) {
            if (DB::getDriverName() !== 'sqlite') {
                Schema::table('enrollment_documents', function (Blueprint $table) {
                    // Modifier la colonne document_type pour accepter des valeurs plus longues
                    DB::statement("ALTER TABLE enrollment_documents MODIFY document_type VARCHAR(50) NOT NULL");
                });
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('enrollment_documents')) {
            if (DB::getDriverName() !== 'sqlite') {
                Schema::table('enrollment_documents', function (Blueprint $table) {
                    // Revenir à ENUM
                    DB::statement("ALTER TABLE enrollment_documents MODIFY document_type ENUM('bac_transcript', 'birth_certificate', 'valid_cni', 'photo_4x4_1', 'photo_4x4_2', 'photo_4x4_3', 'photo_4x4_4', 'payment_receipt') NOT NULL");
                });
            }
        }
    }
};
