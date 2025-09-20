<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('fullname');
            $table->string('phone')->nullable();

            $table->string('purok')->nullable();
            $table->string('sitio')->nullable();
            $table->string('barangay');

            $table->string('branch')->nullable();
            $table->text('notes')->nullable();

            $table->foreignId('plan_id')->constrained('plans');

            $table->date('duedate')->nullable();
            $table->string('state')->default('active');

            $table->timestamps();
        });
    }



    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
