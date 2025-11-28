# 1. Configuration
$REGION = "ap-southeast-2" # Must match your terra/variables.tf
$ACCOUNT_ID = aws sts get-caller-identity --query Account --output text
$REPO_NAME_APP = "dinggo-app"
$REPO_NAME_NGINX = "dinggo-nginx"
$IMAGE_TAG = "latest"

$ECR_URL = "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
$FULL_IMAGE_NAME_APP = "${ECR_URL}/${REPO_NAME_APP}:${IMAGE_TAG}"
$FULL_IMAGE_NAME_NGINX = "${ECR_URL}/${REPO_NAME_NGINX}:${IMAGE_TAG}"

Write-Host "--- Starting Build & Push Process ---" -ForegroundColor Cyan
Write-Host "Region: $REGION"
Write-Host "Repo App:   $REPO_NAME_APP"
Write-Host "Repo Nginx: $REPO_NAME_NGINX"
Write-Host "-------------------------------------"

# 2. Login to ECR
Write-Host "`n[1/5] Logging in to ECR..." -ForegroundColor Yellow
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_URL
if ($LASTEXITCODE -ne 0) { Write-Error "Login failed!"; exit 1 }

# 3. Build Docker Images
Write-Host "`n[2/5] Building App Image..." -ForegroundColor Yellow
docker build -t $REPO_NAME_APP -f docker/production/Dockerfile .
if ($LASTEXITCODE -ne 0) { Write-Error "App Build failed!"; exit 1 }

Write-Host "`n[3/5] Building Nginx Image..." -ForegroundColor Yellow
docker build -t $REPO_NAME_NGINX -f docker/production/nginx/Dockerfile ./docker/production/nginx
if ($LASTEXITCODE -ne 0) { Write-Error "Nginx Build failed!"; exit 1 }

# 4. Tag Images
Write-Host "`n[4/5] Tagging Images..." -ForegroundColor Yellow
docker tag "${REPO_NAME_APP}:${IMAGE_TAG}" $FULL_IMAGE_NAME_APP
docker tag "${REPO_NAME_NGINX}:${IMAGE_TAG}" $FULL_IMAGE_NAME_NGINX

# 5. Push Images
Write-Host "`n[5/5] Pushing to ECR..." -ForegroundColor Yellow
docker push $FULL_IMAGE_NAME_APP
if ($LASTEXITCODE -ne 0) { Write-Error "App Push failed!"; exit 1 }

docker push $FULL_IMAGE_NAME_NGINX
if ($LASTEXITCODE -ne 0) { Write-Error "Nginx Push failed!"; exit 1 }

Write-Host "`nSUCCESS!" -ForegroundColor Green
Write-Host "App Image:   $FULL_IMAGE_NAME_APP" -ForegroundColor Green
Write-Host "Nginx Image: $FULL_IMAGE_NAME_NGINX" -ForegroundColor Green

