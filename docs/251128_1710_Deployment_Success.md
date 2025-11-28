# AWS Deployment Log

**Date:** 2025-11-28 17:10

## Deployment Status: SUCCESS

The application has been successfully deployed to AWS using Terraform.

## Resources Created

### 1. Database (RDS)

- **Endpoint:** `dinggo-db.c5eqwa8u0bfp.ap-southeast-2.rds.amazonaws.com`
- **Engine:** PostgreSQL 16.6
- **Instance:** `db.t3.micro`

### 2. Container Registry (ECR)

- **Repository URL:** `940663608218.dkr.ecr.ap-southeast-2.amazonaws.com/dinggo-app`
- **Image Tag:** `latest`

### 3. Compute (ECS)

- **Cluster Name:** `dinggo-cluster`
- **Service Name:** `dinggo-service`
- **Instance Type:** `t3.micro`

## Next Steps (Accessing the App)

1.  Go to the **AWS Console**.
2.  Navigate to **EC2** > **Instances**.
3.  Find the instance named `dinggo-ecs-instance`.
4.  Copy the **Public IPv4 address**.
5.  Open it in your browser: `http://<PUBLIC_IP>`.

## Troubleshooting

If the site does not load immediately:

1.  **Wait:** It may take a few minutes for the EC2 instance to initialize, pull the Docker image, and start the containers.
2.  **Check Logs:**
    - Go to **ECS** > **Clusters** > `dinggo-cluster`.
    - Click on the **Tasks** tab.
    - Click on the running task ID.
    - Check the **Logs** tab for the `app` and `web` containers.
