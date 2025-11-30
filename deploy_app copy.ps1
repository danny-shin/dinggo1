# 1. Configuration
# "Antigravity" shell is running PowerShell Core (v7+) (which defaults to UTF-8), 
# while VS Code is defaulting to Windows PowerShell (v5.1). uses UTF-16LE encoding for pipes by default.
[System.Console]::InputEncoding = [System.Text.Encoding]::UTF8
[System.Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$env:AWS_PAGER=""		# NOT show -- More  --

# 1. Configuration
$REGION = "ap-southeast-2" # Must match your terra/variables.tf
$ACCOUNT_ID = aws sts get-caller-identity --query Account --output text
$REPO_NAME_APP = "dinggo-app"
$REPO_NAME_NGINX = "dinggo-nginx"
$CLUSTER_NAME = "dinggo-cluster"
$SERVICE_NAME = "dinggo-service"
$TIMESTAMP = Get-Date -Format "yyyyMMdd-HHmm"
$IMAGE_TAG = "v-$TIMESTAMP"

$ECR_URL = "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
$FULL_IMAGE_NAME_APP = "${ECR_URL}/${REPO_NAME_APP}:${IMAGE_TAG}"
$FULL_IMAGE_NAME_NGINX = "${ECR_URL}/${REPO_NAME_NGINX}:${IMAGE_TAG}"
$LATEST_IMAGE_NAME_APP = "${ECR_URL}/${REPO_NAME_APP}:latest"
$LATEST_IMAGE_NAME_NGINX = "${ECR_URL}/${REPO_NAME_NGINX}:latest"

Write-Host "--- Starting Build, Push & Deploy Process ---" -ForegroundColor Cyan
Write-Host "Region:  $REGION"
Write-Host "Cluster: $CLUSTER_NAME"
Write-Host "Service: $SERVICE_NAME"
Write-Host "Tag:     $IMAGE_TAG"
Write-Host "---------------------------------------------"

# 2. Login to ECR
Write-Host "`n[1/6] Logging in to ECR..." -ForegroundColor Yellow
# Use cmd /c to handle the pipe, avoiding PowerShell's UTF-16 encoding issues
cmd /c "aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_URL"
if ($LASTEXITCODE -ne 0) { Write-Error "Login to ECR failed!"; exit 1 }

# 3. Build Docker Images
Write-Host "`n[2/6] Building App Image..." -ForegroundColor Yellow
docker build -t $REPO_NAME_APP -f docker/aws/app/Dockerfile .
if ($LASTEXITCODE -ne 0) { Write-Error "App Build failed!"; exit 1 }

Write-Host "`n[3/6] Building Nginx Image..." -ForegroundColor Yellow
docker build -t $REPO_NAME_NGINX -f docker/aws/nginx/Dockerfile .
if ($LASTEXITCODE -ne 0) { Write-Error "Nginx Build failed!"; exit 1 }

# 4. Tag Images
Write-Host "`n[4/6] Tagging Images..." -ForegroundColor Yellow
docker tag "${REPO_NAME_APP}:latest" $FULL_IMAGE_NAME_APP
docker tag "${REPO_NAME_NGINX}:latest" $FULL_IMAGE_NAME_NGINX
# Also tag as latest for ECR
docker tag "${REPO_NAME_APP}:latest" $LATEST_IMAGE_NAME_APP
docker tag "${REPO_NAME_NGINX}:latest" $LATEST_IMAGE_NAME_NGINX

# 5. Push Images
Write-Host "`n[5/6] Pushing to ECR..." -ForegroundColor Yellow
docker push $FULL_IMAGE_NAME_APP
if ($LASTEXITCODE -ne 0) { Write-Error "App Push failed!"; exit 1 }
docker push $LATEST_IMAGE_NAME_APP
if ($LASTEXITCODE -ne 0) { Write-Error "App Push (latest) failed!"; exit 1 }

docker push $FULL_IMAGE_NAME_NGINX
if ($LASTEXITCODE -ne 0) { Write-Error "Nginx Push failed!"; exit 1 }
docker push $LATEST_IMAGE_NAME_NGINX
if ($LASTEXITCODE -ne 0) { Write-Error "Nginx Push (latest) failed!"; exit 1 }

# 6. Update ECS Service
Write-Host "`n[6/6] Updating ECS Service..." -ForegroundColor Yellow
aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --task-definition dinggo-task --force-new-deployment --region $REGION
if ($LASTEXITCODE -ne 0) { Write-Error "ECS Service Update failed!"; exit 1 }

Write-Host "`nSUCCESS! Deployment triggered." -ForegroundColor Green
# Write-Host "Monitor deployment status with:"
# Write-Host "aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME"
