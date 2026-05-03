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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'contest_manager', 'candidate'])->default('candidate')->after('password');
            $table->string('phone')->nullable()->after('role');
            $table->string('organization')->nullable()->after('phone');
            $table->text('bio')->nullable()->after('organization');
            $table->boolean('is_active')->default(true)->after('bio');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone', 'organization', 'bio', 'is_active']);
        });
    }
};
