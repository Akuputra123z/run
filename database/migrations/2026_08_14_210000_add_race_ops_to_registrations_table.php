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
        Schema::table('registrations', function (Blueprint $table) {
            $table->unsignedInteger('finish_seconds')->nullable()->after('paid_at');
            $table->timestamp('pickup_at')->nullable()->after('finish_seconds');
            $table->timestamp('checked_in_at')->nullable()->after('pickup_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('registrations', function (Blueprint $table) {
            $table->dropColumn(['finish_seconds', 'pickup_at', 'checked_in_at']);
        });
    }
};
