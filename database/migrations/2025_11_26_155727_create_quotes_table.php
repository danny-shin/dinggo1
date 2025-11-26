<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up()
	{
		Schema::create('quotes', function (Blueprint $table) {
			$table->id();

			// Foreign Key linking to cars.id
			// This replaces storing license_plate/state strings here
			$table->foreignId('car_id')
				->constrained('cars')
				->onDelete('cascade');

			$table->decimal('price', 10, 2);
			$table->string('repairer');
			$table->text('overview_of_work');
			$table->timestamps();

			// Prevent duplicate quotes from the same repairer for the same car
			$table->unique(['car_id', 'repairer']);
		});
	}

	public function down()
	{
		Schema::dropIfExists('quotes');
	}
};
