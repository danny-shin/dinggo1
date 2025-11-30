
## [Dev] Create dinggo DB in PosgreSQL 

## Migration Files
- database\migrations\2025_11_26_155648_create_cars_table.php
```php
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
```
- database\migrations\2025_11_26_155727_create_quotes_table.php
```php
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
```
## php artisan migrate
- run all migration files(DDL statements) in database\migrations\
- typically used when creating or altering tables

## Local DingGo DB
![local-debeaver-dingo](./Local%20pgsql%20debeaver%20dinggo.png)

## Schema from DB 
```sql
CREATE TABLE public.cars (
	id bigserial NOT NULL,
	license_plate varchar(255) NOT NULL,
	license_state varchar(255) NOT NULL,
	vin varchar(255) NOT NULL,
	"year" varchar(255) NOT NULL,
	colour varchar(255) NOT NULL,
	make varchar(255) NOT NULL,
	model varchar(255) NOT NULL,
	created_at timestamp(0) NULL,
	updated_at timestamp(0) NULL,
	CONSTRAINT cars_license_plate_license_state_unique UNIQUE (license_plate, license_state),
	CONSTRAINT cars_pkey PRIMARY KEY (id)
);

CREATE TABLE public."quotes" (
	id bigserial NOT NULL,
	car_id int8 NOT NULL,
	price numeric(10, 2) NOT NULL,
	repairer varchar(255) NOT NULL,
	overview_of_work text NOT NULL,
	created_at timestamp(0) NULL,
	updated_at timestamp(0) NULL,
	CONSTRAINT quotes_car_id_repairer_unique UNIQUE (car_id, repairer),
	CONSTRAINT quotes_pkey PRIMARY KEY (id)
);

-- public."quotes" foreign keys
ALTER TABLE public."quotes" ADD CONSTRAINT quotes_car_id_foreign FOREIGN KEY (car_id) REFERENCES public.cars(id) ON DELETE CASCADE;
```

