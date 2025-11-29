# Deployment Update Walkthrough

## Summary

Successfully rebuilt Nginx and App images, pushed them to ECR, and redeployed the ECS service.

## Steps Taken

### 1. Build and Push Images

Ran `build_and_push.ps1` to build new Docker images and push them to ECR.

- **Script**: `d:\www\dinggo1\build_and_push.ps1`
- **New Image Tag**: `v-20251129-1324`

### 2. Update Terraform Configuration

Updated `terra/ecs.tf` to use the new image tag for both `app` and `nginx` containers.

```hcl
# terra/ecs.tf

# App Container
image = "940663608218.dkr.ecr.ap-southeast-2.amazonaws.com/dinggo-app:v-20251129-1324"

# Nginx Container
image = "940663608218.dkr.ecr.ap-southeast-2.amazonaws.com/dinggo-nginx:v-20251129-1324"
```

### 3. Redeploy ECS Service

Ran `terraform apply -auto-approve` to apply the changes.

- **Result**: Resources: 1 added, 1 changed, 1 destroyed.
- **Status**: Apply complete.

## Verification

The ECS service has been updated with the new task definition. The new Nginx image (with the multi-stage build fix) should now be running.
