<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {

            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');

            $table->string('payment_method', 50); 
            $table->string('status', 20)->default('pending');

            $table->decimal('amount', 15, 2);
            $table->string('ref_code')->nullable()->unique();
            $table->string('va_number')->nullable(); 

            $table->timestamp('expired_at')->nullable();
            $table->timestamp('paid_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
