# ECR and Build Workflow Setup

**Date:** 2025-11-28 16:53

## Overview

This document explains the setup for the AWS Elastic Container Registry (ECR) and the automated build script created to streamline the deployment process.

## 1. ECR Repository (`terra/ecr.tf`)

We created a Terraform configuration file `terra/ecr.tf` to provision an ECR repository.

**Key Features:**

- **Repository Name:** `dinggo-app`
- **Mutability:** `MUTABLE` (allows overwriting tags like `latest`).
- **Scanning:** Disabled by default (can be enabled for security scanning).

## 2. Build & Push Script (`build_and_push.ps1`)

We created a PowerShell script `build_and_push.ps1` to automate the Docker build and push lifecycle.

**What the script does:**

1.  **Authentication:** Logs in to your AWS ECR registry using your local AWS credentials.
2.  **Build:** Builds the Docker image using the production Dockerfile (`docker/production/Dockerfile`).
3.  **Tag:** Tags the local image with the full ECR repository URL (e.g., `account-id.dkr.ecr.region.amazonaws.com/dinggo-app:latest`).
4.  **Push:** Pushes the tagged image to AWS ECR.

## Step-by-Step Usage Guide

### Step 1: Create the Infrastructure

Run the following command in the `terra/` directory to create the ECR repository in AWS:

```bash
terraform apply
```

### Step 2: Build and Push the Image

Run the PowerShell script from the project root:

```powershell
.\build_and_push.ps1
```

- **Success Output:** The script will output the full **Image URL** upon success.

### Step 3: Update ECS Configuration

1.  Copy the **Image URL** from the script output.
2.  Open `terra/ecs.tf`.
3.  Locate the `container_definitions` section.
4.  Update the `image` field for the `app` container:
    ```hcl
    {
      name  = "app"
      image = "YOUR_NEW_IMAGE_URL_HERE"
      # ...
    }
    ```

### Step 4: Deploy the Application

Apply the changes to update the ECS service with the new image:

```bash
terraform apply
```
