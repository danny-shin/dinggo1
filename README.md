### Prefix

- [Prod] means production environment (local)
- [Dev] means development environment (local)
- [AWS] means AWS environment (AWS)

---

# 1. Setup Database & API Config

## 1.1 [Dev] Using Host(Windows-11) PostgreSQL

- using host PostgreSQL, NO database service in ompose.dev.yml

### .env.dev

```sh
DINGGO_API_USER=daniel.dongsoo.shin@gmail.com
DINGGO_API_KEY=daniel.dongsoo.shin
DINGGO_API_URL=https://app.dev.aws.dinggo.com.au/phptest

DB_CONNECTION=pgsql
# 👉 Using DBMS(pgsql) On Windows11(host)
DB_HOST=host.docker.internal
DB_PORT=5432
DB_DATABASE=dinggo
DB_USERNAME=postgres
DB_PASSWORD=12345_Abc
```

### compose.dev.yml

- No database service

---

## 1.2 [Prod] Using Docker PostgreSQL(database)

- in [Prod], using docker database service

### .env.prod

```sh
DINGGO_API_USER=daniel.dongsoo.shin@gmail.com
DINGGO_API_KEY=daniel.dongsoo.shin
DINGGO_API_URL=https://app.dev.aws.dinggo.com.au/phptest

DB_CONNECTION=pgsql
# 👉 compose.prod.yml - database
DB_HOST=database
DB_PORT=5432
DB_DATABASE=dinggo
DB_USERNAME=postgres
DB_PASSWORD=12345_Abc
```

### compose.prod.yml

```
  database:
    image: postgres:16-alpine
    restart: always
    env_file:
      - .env.prod
    volumes:
      - db_data:/var/lib/postgresql/data
    networks:
      - app-network
```

## 1.3 [AWS] Using AWS RDS PostgreSQL

- in [AWS], using AWS RDS PostgreSQL

### terra\variables.tf

```sh
variable "db_name" {
  description = "Database Name"
  default     = "dinggo"
}
variable "db_username" {
  description = "Database Username"
  default     = "dinggo"
}
variable "db_password" {
  description = "Database Password"
  type        = string
  sensitive   = true
}
```

### terra\rds.tf

```sh
resource "aws_db_instance" "main" {
  identifier        = "${var.project_name}-db"
  engine            = "postgres"
  engine_version    = "16.6" # Check available versions, 16 is usually fine
  instance_class    = "db.t3.micro"
  allocated_storage = 10
  storage_type      = "gp2"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  # ...
```

### terra\ecs.tf

```sh
resource "aws_ecs_task_definition" "app" {
  family             = "${var.project_name}-task"
  network_mode       = "bridge"
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  cpu                = "256" # t3.micro has 2 vCPUs, but we limit task
  memory             = "512" # t3.micro has 1GB
  # ...
  container_definitions = jsonencode([
    {
      name      = "app"
      image     = "${aws_ecr_repository.app.repository_url}:latest"
      cpu       = 128
      memory    = 256
      essential = true
      environment = [
        { name = "DB_HOST", value = aws_db_instance.main.address },
        { name = "DB_DATABASE", value = aws_db_instance.main.db_name },
        { name = "DB_USERNAME", value = aws_db_instance.main.username },
        { name = "DB_PASSWORD", value = var.db_password },
        { name = "DINGGO_API_USER", value = var.dinggo_api_user },
        { name = "DINGGO_API_KEY", value = var.dinggo_api_key },
        { name = "DINGGO_API_URL", value = var.dinggo_api_url },
        { name = "APP_ENV", value = var.app_env },
      ]
```

---

# 2. Deploy Application

## 2.1 [Dev] compose.dev.yml

- run containers

```sh
# build & start all the containers
docker compose -f .\compose.prod.yml up -d --build
```

- 👉 If the page doesn't load when you browse to http://localhost, try refreshing/pressing F5 (NOT Ctrl+F5), as it's especially slow in dev mode.

- When Update Program Source: clear caches & restart containers

```sh
docker compose -f .\compose.dev.yml exec workspace php artisan optimize:clear
docker compose -f .\compose.dev.yml exec workspace php artisan clear-compiled
docker compose -f .\compose.dev.yml restart
```

### 2.1.1 Manual migration, seeder execution, and data synchronization

```sh
# Dev DB migration(create tables) & Seeder
docker compose -f .\compose.dev.yml exec workspace php artisan migrate
docker compose -f .\compose.dev.yml exec workspace php artisan db:seed
# add 2 users: admin1@example.com pw:123456789, admin2@example.com pw:123456789
docker compose -f .\compose.dev.yml exec workspace php artisan sync:api-data
```

- If you don't run the migration and seeder, you won't be able to log in to the application. This is because the database tables haven't been created yet, and no users have been registered.

<h3 id="artisan-migrate">2.1.2 php artisan migrate</h3>

- run DDL(create/alter DB Tables) in database\migrations
- create tables in dinggo DB

<h3 id="artisan-db-seed">2.1.3 php run db:seed</h3>

- run all seeder files in database\seeders\
- add 2 users:
  1. email: admin1@example.com password: 123456789
  2. email: admin2@example.com password: 123456789

<h3 id="artisan-sync-api-data">2.1.4 php artisan sync:api-data</h3>

- run app\Console\Commands\SyncApiData.php
- fetch cars & quotes and save to the DB tables
- If you need regular data synchronization, you can register it in crontab and use it.
- If the model's properties have changed, save to the table, otherwise, do not save.

<h3 id='browse-localhost'> 2.1.5 browse http://localhost</h3>

- login
  - email: admin1@example.com or admin2@example.com
  - password: 123456789
- redirect to /cars
  ![Dev Cars](./docs/dev-cars.png)

---

## 2.2 [Prod] compose.prod.yml

- run containers

```sh
docker compose -f .\compose.prod.yml up -d
```

### 2.2.1 Automatic migration, seeder execution, and data synchronization

- docker\production\entrpoint.sh: runs when the container starts

```sh
php artisan migrate --force   # create tables
php artisan db:seed --force   # add 2 users: admin1@example.com, admin2@example.com pw:123456789
php artisan sync:api-data     # data sync (cars & quotes)
```

### [2.2.2 php artisan migrate](#artisan-migrate)

### [2.2.3 php artisan db:seed](#artisan-db-seed)

### [2.2.4 php artisan sync:api-data](#artisan-sync-api-data)

### [2.2.5 browse http://localhost](#browse-localhost)

---

## 2.3 [AWS] Deploy Application to AWS

### 2.3.1. Prerequisites

1. **AWS CLI Configured:** Ensure you have run `aws configure` with your credentials.

```sh
dinggo1> aws configure
AWS Access Key ID [None]: Your-AWS-Access-Key-ID-Here
AWS Secret Access Key [None]: Your-AWS-Secret-Access-Key-Here
Default region name [None]: ap-southeast-2
Default output format [None]:
```

2. **Terraform Installed:** Ensure `terraform` is in your path.
3. **Docker Running:** Ensure Docker Desktop is running.

### 2.3.2 deploy_app.ps1

- run deploy_app.ps1: check AWS resources and run terraform apply

```powershell
powershell -ExecutionPolicy Bypass -File deploy_app.ps1
```

#### 2.3.3 Checking ECR repositories exists (deploy_app.ps1)

- checking dinggo-app and dinggo-nginx exists in AWS ECR
- if NOT exists, init terraform and create ECR repositories

```sh
terraform init
terraform apply -target="aws_ecr_repository.app" -auto-approve
terraform apply -target="aws_ecr_repository.nginx" -auto-approve
```

#### 2.3.4 Login, Build & Push Images to ECR (deploy_app.ps1)

- dinggo-app & dinggo-nginx images build & push to ECR

```sh
docker build -t $REPO_NAME_APP -f docker/aws/app/Dockerfile .
docker build -t $REPO_NAME_NGINX -f docker/aws/nginx/Dockerfile .
# ...
docker tag "${REPO_NAME_APP}:latest" $LATEST_IMAGE_NAME_APP
docker tag "${REPO_NAME_NGINX}:latest" $LATEST_IMAGE_NAME_NGINX
# ...
docker push $LATEST_IMAGE_NAME_APP
docker push $LATEST_IMAGE_NAME_NGINX
```

#### 2.3.5 Check & Update ECS Service, Create/Update Infrastructure (deploy_app.ps1)

1. check dinggo-cluster & dinggo-service exists in AWS ECS
2. if exists, update ECS service

```sh
aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --task-definition dinggo-task --force-new-deployment --region $REGION --no-cli-pager
```

3. Create/Update Infrastructure

```sh
terraform apply -auto-approve
```

- "terraform apply" automatically checked the modified files and apply the changes

4. Display the app url

### 2.3.6 Browse the url

- login
  - email: admin1@example.com or admin2@example.com
  - password: 123456789
- redirect to /cars
  ![AWS Cars](./docs/aws-cars.png)

---

# 3. [Dev] Unit Testing

- Laravel testing is designed to run in development or testing environments (and blocked from running in production) primarily for safety and data integrity.

## 3.1 tests\Feature\DinggoApiTest.php

- 4 endpoints test
  1. https://app.dev.aws.dinggo.com.au/phptest/test
  2. https://app.dev.aws.dinggo.com.au/phptest/testcreds
  3. https://app.dev.aws.dinggo.com.au/phptest/cars
  4. https://app.dev.aws.dinggo.com.au/phptest/quotes

## 3.2 tests\Feature\SyncApiDataTest.php(sync:api-data)

- tests correctly fetches car and quote data and save to the local DB
- verifies data integrity by confirming that new records are inserted correctly and existing records are updated (not duplicated)

## 3.3 tests\Feature\CarTest.php

- create mock user & data for the test
- test the index page lists cars and sorts them correctly.
- test the detail page shows the correct car and successfully eager-loads its associated quotes.

## 3.4 Run tests

- 👉 after run tests you need to run below:
  - some tests use RefreshDatabase trait and this make Laravel automatically wipes the database clean (using `migrate:fresh`) to ensure the test starts with a blank slate.

```sh
docker compose -f .\compose.dev.yml exec workspace php artisan db:seed
#  optional docker compose -f .\compose.dev.yml exec workspace php artisan sync:api-data
```

- Run all tests

```sh
docker compose -f .\compose.prod.yml exec workspace php artisan test
```

![Dev Artisan Test](./docs/dev-artisan-test.png)

- Run one test

```sh
docker compose -f compose.dev.yml exec workspace php artisan test tests/Feature/CarTest.php
```

---

# 4. DB Schema

- [Dev] Create dinggo DB in PosgreSQL

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
