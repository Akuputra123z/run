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
        Schema::table('route_maps', function (Blueprint $table) {
            $table->string('detail_photo_path')->nullable()->after('photo_thumb_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('route_maps', function (Blueprint $table) {
            $table->dropColumn('detail_photo_path');
        });
    }
};
