<!-- Purpose: Short, actionable instructions so AI coding agents are productive in this repo -->
# Copilot / AI Agent Instructions

Summary
- This is a Laravel app with local Docker compose dev/prod setups, Terraform for AWS (ECS/ECR/RDS), and helper PowerShell deployment scripts. Key workflows center on containers, `php artisan` commands, and Terraform (`terra/`).

Big picture
- Backend: Laravel app under `app/`, `routes/`, `database/` (migrations/seeders). Models of interest: `app/Car.php`, `app/Quote.php`, `app/User.php`.
- Infra: Terraform under `terra/` (e.g., `rds.tf`, `ecs.tf`, `vpc.tf`) creates ECR, ECS, RDS. Deployment orchestrated by `deploy_app.ps1`.
- Local dev: `compose.dev.yml` (no DB service — uses host PostgreSQL) and `compose.prod.yml` (includes `database` service).
- Data flow: External API sync is implemented in `app/Console/Commands/SyncApiData.php` and populates `cars` and `quotes` tables via seed/migration pipelines.

Project-specific conventions (do not invent alternatives)
- Environment files: use ` .env.dev` for local host DB and ` .env.prod` for compose.prod.yml. The repo expects `DB_HOST=host.docker.internal` for dev and `DB_HOST=database` for prod.
- Compose usage:
  - Dev build & run: `docker compose -f .\compose.dev.yml up -d --build`
  - Prod run: `docker compose -f .\compose.prod.yml up -d`
- Database lifecycle:
  - Run migrations: `docker compose -f .\compose.dev.yml exec workspace php artisan migrate`
  - Seed: `docker compose -f .\compose.dev.yml exec workspace php artisan db:seed`
  - Sync external API: `docker compose -f .\compose.dev.yml exec workspace php artisan sync:api-data`
  - Note: Tests may use `RefreshDatabase` so you often need to reseed after tests.

Testing & CI-relevant commands
- Run tests inside the workspace container:
  - All tests: `docker compose -f .\compose.prod.yml exec workspace php artisan test`
  - Single test: `docker compose -f .\compose.dev.yml exec workspace php artisan test tests/Feature/CarTest.php`
- After tests that wipe DB, reseed with: `docker compose -f .\compose.dev.yml exec workspace php artisan db:seed`

Deployment & infra notes
- `deploy_app.ps1` does most AWS deployment tasks (ECR/ECS push, terraform apply). For automation, follow its sequence: check ECR repos, build/tag/push images, `terraform init`/`apply`, then update ECS service.
- Terraform inputs live in `terra/` and include RDS credentials (`rds.tf`), ECS task definitions (`ecs.tf`), and `vpc.tf` network configuration. Avoid hardcoding credentials — use existing `terra/variables.tf` patterns.

> Examples in repo to consult when changing behavior
- Sync command: `app/Console/Commands/SyncApiData.php` — shows API fetch logic and how models are saved (avoid duplicating records).
- Migration example: `database/migrations/2025_11_26_155648_create_cars_table.php` — schema expectations for `cars` table.
- Entrypoint for prod containers: `docker/production/entrypoint.sh` — runs `php artisan migrate --force`, seed, and sync on container start.

Behavioral hints for code edits
- Prefer minimal, backwards-compatible changes. Migrations and seeders are sensitive — keep schema changes explicit and add migration files rather than editing old ones.
- When adding API calls or background syncs, follow existing pattern in `SyncApiData` (avoid re-saving identical models; tests verify no duplicates).
- For frontend assets or build changes, check `vite.config.js`, `resources/js`, and `package.json` scripts.

Files to inspect first
- `README.md` (workflow & commands)
- `compose.dev.yml`, `compose.prod.yml`
- `deploy_app.ps1`, `terra/*` (terraform manifests)
- `app/Console/Commands/SyncApiData.php`, `app/` models and controllers
- `database/migrations/`, `database/seeders/`

If unsure, ask short clarifying questions
- "Should I change the DB_HOST default in `.env.*` or follow README conventions?"
- "Do you want infra changes committed to `terra/` or handled manually via `deploy_app.ps1`?"

End of file — ask the maintainer for missing infra secrets, test CRON schedules, or preferences for schema migrations before making infra changes.
