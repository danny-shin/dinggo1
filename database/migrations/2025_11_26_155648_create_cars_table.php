<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up()
	{
		Schema::create('cars', function (Blueprint $table) {
			// Standard Primary Key
			$table->id();

			// Data columns
			$table->string('license_plate');
			$table->string('license_state');
			$table->string('vin');
			$table->string('year');
			$table->string('colour');
			$table->string('make');
			$table->string('model');
			$table->timestamps();

			// Enforce Uniqueness on the combination of Plate + State
			$table->unique(['license_plate', 'license_state']);
		});
	}

	public function down()
	{
		Schema::dropIfExists('cars');
	}
};
