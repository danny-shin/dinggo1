# 1. Configuration
$REGION = "ap-southeast-2" # Must match your terra/variables.tf
$ACCOUNT_ID = aws sts get-caller-identity --query Account --output text
$REPO_NAME = "dinggo-app" # Must match the name in terra/ecr.tf
$IMAGE_TAG = "latest"

$ECR_URL = "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
$FULL_IMAGE_NAME = "${ECR_URL}/${REPO_NAME}:${IMAGE_TAG}"

Write-Host "--- Starting Build & Push Process ---" -ForegroundColor Cyan
Write-Host "Region: $REGION"
Write-Host "Repo:   $REPO_NAME"
Write-Host "Image:  $FULL_IMAGE_NAME"
Write-Host "-------------------------------------"

# 2. Login to ECR
Write-Host "`n[1/4] Logging in to ECR..." -ForegroundColor Yellow
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_URL
if ($LASTEXITCODE -ne 0) { Write-Error "Login failed!"; exit 1 }

# 3. Build Docker Image
Write-Host "`n[2/4] Building Docker Image..." -ForegroundColor Yellow
# We use the production dockerfile
docker build -t $REPO_NAME -f docker/production/Dockerfile .
if ($LASTEXITCODE -ne 0) { Write-Error "Build failed!"; exit 1 }

# 4. Tag Image
Write-Host "`n[3/4] Tagging Image..." -ForegroundColor Yellow
docker tag "$REPO_NAME`:$IMAGE_TAG" $FULL_IMAGE_NAME

# 5. Push Image
Write-Host "`n[4/4] Pushing to ECR..." -ForegroundColor Yellow
docker push $FULL_IMAGE_NAME
if ($LASTEXITCODE -ne 0) { Write-Error "Push failed!"; exit 1 }

Write-Host "`nSUCCESS! Image pushed to: $FULL_IMAGE_NAME" -ForegroundColor Green
Write-Host "You can now update your terra/ecs.tf to use this image URL." -ForegroundColor Green
