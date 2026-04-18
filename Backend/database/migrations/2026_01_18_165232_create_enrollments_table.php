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
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidate_id')->constrained('candidates')->onDelete('cascade');
            $table->string('full_name');
            $table->string('date_of_birth');
            $table->string('gender');
            $table->string('nationality');
            $table->string('id_number')->unique();
            $table->string('id_type');
            $table->text('address');
            $table->string('city');
            $table->string('country');
            $table->string('postal_code');
            $table->string('education_level');
            $table->string('school_name')->nullable();
            $table->string('field_of_study')->nullable();
            $table->text('professional_experience')->nullable();
            $table->string('current_job_title')->nullable();
            $table->string('company_name')->nullable();
            $table->text('motivation_letter')->nullable();
            $table->string('emergency_contact_name');
            $table->string('emergency_contact_phone');
            $table->string('emergency_contact_relationship');
            $table->enum('status', ['incomplete', 'completed', 'submitted', 'approved', 'rejected'])->default('incomplete');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};
