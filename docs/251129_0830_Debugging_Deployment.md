# Debugging Deployment Error - 2025-11-29 08:30

## Issue

User reports errors when accessing `http://52.62.204.136` (ECS Instance Public IP).

## Investigation Steps

1.  **Check URL**: Access the URL to identify the specific error (502, 404, etc.).
2.  **Analyze Error**:
    - **502 Bad Gateway**: Nginx is running but cannot reach the App container. Check:
      - App container status.
      - Networking/Links between Nginx and App.
      - App container logs (startup errors).
    - **Connection Refused/Timeout**: Security Group or Nginx not running.
    - **404 Not Found**: Nginx running, but file/route not found.
3.  **Check Configuration**: Review `ecs.tf` for port mappings, links, and security groups.

## Findings

- [x] URL Check Result: HTML loads, but assets (JS/CSS) are missing (404/old hashes).
- [x] Cause: Nginx image was copying assets from local `public` folder, which had outdated build artifacts. The App image builds fresh assets internally, leading to hash mismatch.
- [x] Fix: Updated `docker/production/nginx/Dockerfile` to include a build stage (multi-stage build) so it generates fresh assets matching the App image.

## Next Steps

1.  User needs to rebuild the Nginx image.
2.  Push new image to ECR.
3.  Redeploy ECS service.
