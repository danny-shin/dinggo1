# Debugging Deployment Errors Walkthrough

## Issue

User reported errors when accessing `http://52.62.204.136/`.
Investigation revealed that assets (JS/CSS) were returning 404 errors.

## Root Cause Analysis

1.  **Asset Mismatch**: Initially suspected a mismatch between App and Nginx images.
2.  **Stuck Deployment**: Further investigation showed that the **new deployment was stuck** and not rolling out.
    - The ECS service was unable to place the new task because the `t3.micro` instance (1GB RAM) did not have enough free memory to run both the old and new tasks simultaneously during the rolling update.
    - Error message: `(service dinggo-service) was unable to place a task because no container instance met all of its requirements... has insufficient memory available.`

## Fix

Updated the ECS deployment strategy in `terra/ecs.tf` to allow ECS to stop the old task _before_ starting the new one.

```hcl
# terra/ecs.tf

resource "aws_ecs_service" "main" {
  # ...
  deployment_minimum_healthy_percent = 0
  deployment_maximum_percent         = 100
}
```

- **`deployment_minimum_healthy_percent = 0`**: Allows the service to drop below 100% healthy (i.e., 0 running tasks) during deployment.
- **`deployment_maximum_percent = 100`**: Ensures we don't try to start more than 1 task, forcing the stop-first behavior.

## Verification

1.  Applied Terraform changes: `terraform apply`.
2.  Monitored ECS service: Confirmed old task stopped and new task started.
3.  Checked URL: `http://52.62.204.136/` loads correctly.
4.  Checked Asset: `http://52.62.204.136/build/assets/app-C6CNxIaA.js` is now accessible (200 OK).

## Conclusion

The application is now successfully deployed and serving assets correctly.
