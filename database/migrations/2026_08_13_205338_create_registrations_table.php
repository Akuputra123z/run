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
        Schema::create('registrations', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('phone');
            $table->string('nik', 16)->nullable();
            $table->enum('gender', ['men', 'women']);
            $table->date('birth_date');
            $table->string('city');
            $table->string('jersey_size', 5);
            $table->string('emergency_name');
            $table->string('emergency_phone');
            $table->string('community')->nullable();
            $table->string('status')->default('pending_payment');
            $table->string('race_number', 12)->nullable()->unique();
            $table->unsignedInteger('total_amount');
            $table->timestamp('payment_due_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registrations');
    }
};
