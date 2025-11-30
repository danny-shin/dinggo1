# Deployment Script Implementation Plan

## Goal Description

Streamline the deployment process for code-only changes. Currently, the user runs multiple manual steps including `terraform apply`. The new solution will be a PowerShell script `deploy_app.ps1` that builds the Docker images, pushes them to ECR, and triggers a forced deployment on the ECS service, bypassing the need for Terraform for simple code updates.

## User Review Required

> [!NOTE]
> This script assumes the infrastructure (ECS Cluster, Service, ECR Repos) already exists and is correctly named based on the Terraform configuration (`dinggo-cluster`, `dinggo-service`).

## Proposed Changes

### Root Directory

#### [NEW] [deploy_app.ps1](file:///d:/www/dinggo1/deploy_app.ps1)

- A new PowerShell script that performs the following:
  1.  **Configuration**: Sets variables for Region, Repo Names, and Cluster/Service names.
  2.  **ECR Login**: Authenticates Docker with AWS ECR.
  3.  **Build**: Builds `dinggo-app` and `dinggo-nginx` Docker images.
  4.  **Tag**: Tags images with a timestamp and `latest`.
  5.  **Push**: Pushes both tags to ECR.
  6.  **Deploy**: Runs `aws ecs update-service --cluster dinggo-cluster --service dinggo-service --force-new-deployment` to trigger a rolling update.

## Verification Plan

### Automated Tests

- None. This is a deployment script.

### Manual Verification

1.  Run the script: `powershell -ExecutionPolicy Bypass -File deploy_app.ps1`
2.  Observe the output for successful build, push, and deployment trigger.
3.  Check AWS Console (ECS) or use AWS CLI to verify the service is updating:
    - `aws ecs describe-services --cluster dinggo-cluster --services dinggo-service`
    - Check for `deployments` status.
4.  Verify the application is running with the new code by accessing the public URL.
