<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->foreignId('exam_center_id')->nullable()->constrained('exam_centers')->onDelete('set null');
            $table->foreignId('deposit_center_id')->nullable()->constrained('deposit_centers')->onDelete('set null');
            $table->string('cni_number')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropForeignIdFor('ExamCenter');
            $table->dropForeignIdFor('DepositCenter');
            $table->dropColumn(['exam_center_id', 'deposit_center_id', 'cni_number']);
        });
    }
};
