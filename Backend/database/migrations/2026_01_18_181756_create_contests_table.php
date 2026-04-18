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
        Schema::create('contests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->text('requirements')->nullable();
            $table->integer('max_participants')->nullable();
            $table->decimal('registration_fee', 10, 2)->default(0);
            $table->dateTime('registration_start_date');
            $table->dateTime('registration_end_date');
            $table->dateTime('contest_date');
            $table->string('location')->nullable();
            $table->enum('status', ['upcoming', 'open', 'closed', 'ongoing', 'completed'])->default('upcoming');
            $table->text('prizes')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contests');
    }
};
