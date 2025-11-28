# Final Nginx Fix: Unique Image Tags

**Date:** 2025-11-28 17:58

## Issue

Despite updating the Nginx image to remove the default page, the ECS service was likely still using a cached version of the `latest` image, or the deployment didn't trigger a pull of the new image content.

## Solution

We switched from using the `latest` tag to **unique timestamp-based tags** (e.g., `v-20251128-1758`).

### Steps Taken

1.  **Updated Build Script:** Modified `build_and_push.ps1` to generate a tag based on the current timestamp.
2.  **Built & Pushed:** Created new images:
    - `dinggo-app:v-20251128-1758`
    - `dinggo-nginx:v-20251128-1758`
3.  **Updated Terraform:** Updated `terra/ecs.tf` to use these specific tags.
4.  **Redeployed:** Ran `terraform apply`.

## Why this works

By changing the image tag in the ECS Task Definition, we force ECS to:

1.  Register a new Task Definition revision.
2.  Stop the old tasks.
3.  Start new tasks using the _exact_ new image specified.
4.  This bypasses any caching issues associated with the mutable `latest` tag.

## Verification

1.  Wait for the new task to start (approx. 1-2 mins).
2.  Refresh `http://<PUBLIC_IP>`.
3.  You should now see the Laravel application.
