<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enrollment_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained('enrollments')->onDelete('cascade');
            $table->enum('document_type', ['bac_transcript', 'birth_certificate', 'valid_cni', 'photo_4x4_1', 'photo_4x4_2', 'photo_4x4_3', 'photo_4x4_4', 'payment_receipt']);
            $table->foreignId('contest_id')->nullable()->constrained('contests')->onDelete('set null');
            $table->string('file_path');
            $table->string('original_filename');
            $table->string('mime_type');
            $table->integer('file_size');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollment_documents');
    }
};
