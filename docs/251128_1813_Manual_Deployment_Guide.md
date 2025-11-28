# Manual Deployment Guide

**Date:** 2025-11-28 18:13

This guide explains how to deploy the application from scratch after destroying previous resources.

## Prerequisites

1.  **AWS CLI Configured:** Ensure you have run `aws configure` with your credentials.
2.  **Terraform Installed:** Ensure `terraform` is in your path.
3.  **Docker Running:** Ensure Docker Desktop is running.

## Step 1: Create Infrastructure (Part 1 - ECR)

First, we need to create the ECR repositories so we have a place to push our images.

1.  Open a terminal in the `terra/` directory.
2.  Run:
    ```bash
    terraform init
    terraform apply -target=aws_ecr_repository.app -target=aws_ecr_repository.nginx
    ```
    _Type `yes` when prompted._

## Step 2: Build and Push Images

Now that the repositories exist, we build and push the Docker images.

1.  Open a terminal in the project root (`d:\www\dinggo1`).
2.  Run the build script:
    ```powershell
    .\build_and_push.ps1
    ```
3.  **Copy the Image URLs** from the script output (e.g., `.../dinggo-app:v-20251128-1815`).

## Step 3: Update Configuration

We need to tell Terraform which images to use.

1.  Open `terra/ecs.tf`.
2.  Find the `container_definitions` section.
3.  Update the `image` field for **app**:
    ```hcl
    {
      name  = "app"
      image = "YOUR_APP_IMAGE_URL_FROM_STEP_2"
      # ...
    }
    ```
4.  Update the `image` field for **web**:
    ```hcl
    {
      name  = "web"
      image = "YOUR_NGINX_IMAGE_URL_FROM_STEP_2"
      # ...
    }
    ```
5.  Save the file.

## Step 4: Deploy Full Infrastructure

Now we create the rest of the infrastructure (VPC, RDS, ECS, etc.) using the correct images.

1.  Back in the `terra/` directory terminal.
2.  Run:
    ```bash
    terraform apply
    ```
    _Type `yes` when prompted._
3.  Wait for completion (RDS creation takes ~5-10 minutes).

## Step 5: Access the Application

1.  Once Terraform completes, go to the **AWS Console** > **EC2**.
2.  Find the instance named `dinggo-ecs-instance`.
3.  Copy the **Public IPv4 address**.
4.  Open it in your browser.

## Troubleshooting

- **"Welcome to nginx!":** If you see this, force a new deployment:
  ```bash
  aws ecs update-service --cluster dinggo-cluster --service dinggo-service --force-new-deployment --region ap-southeast-2
  ```
