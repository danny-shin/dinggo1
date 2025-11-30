# 1. Configuration
# "Antigravity" shell is running PowerShell Core (v7+) (which defaults to UTF-8), 
# while VS Code is defaulting to Windows PowerShell (v5.1). uses UTF-16LE encoding for pipes by default.
[System.Console]::InputEncoding = [System.Text.Encoding]::UTF8
[System.Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 1. Configuration
$REGION = "ap-southeast-2" # Must match your terra/variables.tf
$ACCOUNT_ID = aws sts get-caller-identity --query Account --output text --no-cli-pager
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

# 2. Check ECR Repositories & Create if Missing
Write-Host "`n[1/8] Checking ECR Repositories..." -ForegroundColor Yellow
aws ecr describe-repositories --repository-names $REPO_NAME_APP --no-cli-pager > $null 2>&1
$appRepoExists = $LASTEXITCODE -eq 0
aws ecr describe-repositories --repository-names $REPO_NAME_NGINX --no-cli-pager > $null 2>&1
$nginxRepoExists = $LASTEXITCODE -eq 0

if (-not $appRepoExists -or -not $nginxRepoExists) {
    Write-Host "ECR Repositories not found. Initializing Terraform..." -ForegroundColor Yellow
    Push-Location terra
    terraform init
    terraform apply -target="aws_ecr_repository.app" -auto-approve
    terraform apply -target="aws_ecr_repository.nginx" -auto-approve
    Pop-Location
} else {
    Write-Host "ECR Repositories exist." -ForegroundColor Green
}

# 3. Login to ECR
Write-Host "`n[2/8] Logging in to ECR..." -ForegroundColor Yellow
# Use cmd /c to handle the pipe, avoiding PowerShell's UTF-16 encoding issues
cmd /c "aws ecr get-login-password --region $REGION --no-cli-pager | docker login --username AWS --password-stdin $ECR_URL"
if ($LASTEXITCODE -ne 0) { Write-Error "Login to ECR failed!"; exit 1 }

# 3. Build Docker Images
Write-Host "`n[3/8] Building App Image..." -ForegroundColor Yellow
docker build -t $REPO_NAME_APP -f docker/aws/app/Dockerfile .
if ($LASTEXITCODE -ne 0) { Write-Error "App Build failed!"; exit 1 }

Write-Host "`n[4/8] Building Nginx Image..." -ForegroundColor Yellow
docker build -t $REPO_NAME_NGINX -f docker/aws/nginx/Dockerfile .
if ($LASTEXITCODE -ne 0) { Write-Error "Nginx Build failed!"; exit 1 }

# 5. Tag Images
Write-Host "`n[5/8] Tagging Images..." -ForegroundColor Yellow
docker tag "${REPO_NAME_APP}:latest" $FULL_IMAGE_NAME_APP
docker tag "${REPO_NAME_NGINX}:latest" $FULL_IMAGE_NAME_NGINX
# Also tag as latest for ECR
docker tag "${REPO_NAME_APP}:latest" $LATEST_IMAGE_NAME_APP
docker tag "${REPO_NAME_NGINX}:latest" $LATEST_IMAGE_NAME_NGINX

# 6. Push Images
Write-Host "`n[6/8] Pushing to ECR..." -ForegroundColor Yellow
docker push $FULL_IMAGE_NAME_APP
if ($LASTEXITCODE -ne 0) { Write-Error "App Push failed!"; exit 1 }
docker push $LATEST_IMAGE_NAME_APP
if ($LASTEXITCODE -ne 0) { Write-Error "App Push (latest) failed!"; exit 1 }

docker push $FULL_IMAGE_NAME_NGINX
if ($LASTEXITCODE -ne 0) { Write-Error "Nginx Push failed!"; exit 1 }
docker push $LATEST_IMAGE_NAME_NGINX
if ($LASTEXITCODE -ne 0) { Write-Error "Nginx Push (latest) failed!"; exit 1 }

# 7. Update ECS Service
Write-Host "`n[7/8] Updating ECS Service..." -ForegroundColor Yellow

# Check if Cluster exists
aws ecs describe-clusters --clusters $CLUSTER_NAME --query "clusters[?status=='ACTIVE'].clusterName" --output text --no-cli-pager | Out-String -OutVariable clusterCheck
# Check if Service exists
aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --query "services[?status=='ACTIVE'].serviceName" --output text --no-cli-pager | Out-String -OutVariable serviceCheck

# 8. Update ECS Service & Infrastructure
if ($clusterCheck.Trim() -eq $CLUSTER_NAME -and $serviceCheck.Trim() -eq $SERVICE_NAME) {
    aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --task-definition dinggo-task --force-new-deployment --region $REGION --no-cli-pager
    if ($LASTEXITCODE -ne 0) { Write-Error "ECS Service Update failed!"; exit 1 }
    Write-Host "`n[8/8] Updating Infrastructure ..." -ForegroundColor Yellow
    Push-Location terra
    terraform apply -auto-approve
    Pop-Location
} else {
    Write-Host "Cluster '$CLUSTER_NAME' or Service '$SERVICE_NAME' not found or inactive." -ForegroundColor Magenta
    Write-Host "n[8/8] Creating Infrastructure ..." -ForegroundColor Yellow
    Push-Location terra
    terraform apply -auto-approve
    Pop-Location
}
Write-Host "`nSUCCESS! Deployment triggered." -ForegroundColor Green
Write-Host "Monitor deployment status with:"
Write-Host "aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --no-cli-pager"

# Get and display Public IP
try {
    $PUBLIC_IP = aws ec2 describe-instances --filters "Name=tag:Name,Values=dinggo-ecs-instance" --query "Reservations[*].Instances[*].PublicIpAddress" --output text --no-cli-pager
    if ($PUBLIC_IP -and $PUBLIC_IP -ne "None") {
        Write-Host "`nApp Public IP: $PUBLIC_IP" -ForegroundColor Cyan
        Write-Host "URL: http://$PUBLIC_IP" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Could not retrieve Public IP." -ForegroundColor Orange
}
