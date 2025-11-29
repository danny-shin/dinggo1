# Terraform Architecture and Deployment Guide

This document explains the Terraform configuration found in the `terra/` directory, how the resources interact, and how to deploy and monitor the infrastructure on AWS.

## 1. Terraform File Structure & Explanation

The infrastructure is defined across multiple `.tf` files to keep the configuration modular and manageable.

### Core Configuration

- **`provider.tf`**: Configures the AWS provider. It specifies the required provider version and sets the AWS region based on the `var.region` variable.
- **`variables.tf`**: Defines input variables for the project, such as `region`, `project_name`, `db_password`, `vpc_cidr`, and API credentials (`dinggo_api_user`, etc.). These allow you to customize the deployment without changing the code.
- **`outputs.tf`**: Defines useful output values returned after a successful deployment, such as the `rds_endpoint`, `ecr_repository_url`, and `ecs_cluster_name`.

### Networking

- **`vpc.tf`**: Sets up the network foundation.
  - **VPC**: The virtual network for the project.
  - **Subnets**: Two public subnets (`public_1`, `public_2`) in different availability zones for high availability.
  - **Internet Gateway**: Allows the VPC to communicate with the internet.
  - **Route Table**: Routes traffic from subnets to the Internet Gateway.
  - **Security Groups**:
    - `ecs_sg`: Allows HTTP (80) and SSH (22) traffic from anywhere to the ECS instances.
    - `rds_sg`: Allows PostgreSQL (5432) traffic _only_ from `ecs_sg` (the application).
    - `efs_sg`: Allows NFS (2049) traffic _only_ from `ecs_sg`.

### Storage & Artifacts

- **`ecr.tf`**: Creates Elastic Container Registry (ECR) repositories to store Docker images.
  - `aws_ecr_repository.app`: For the Laravel application image.
  - `aws_ecr_repository.nginx`: For the Nginx web server image.
- **`rds.tf`**: Provisions the relational database.
  - **DB Subnet Group**: Groups the subnets where the DB can exist.
  - **RDS Instance**: A PostgreSQL `db.t3.micro` instance. It is configured to be private (not publicly accessible) and accessible only by the ECS service via security groups.
- **`efs.tf`**: Sets up Elastic File System (EFS) for shared storage.
  - **EFS File System**: The actual file storage.
  - **Mount Targets**: Network interfaces in each subnet to allow EC2 instances to mount the file system.

### Compute & Application (`ecs.tf`)

This is the core file defining the application runtime.

- **IAM Roles**:
  - `ecs_instance_role`: Allows EC2 instances to register with the ECS cluster.
  - `ecs_task_execution_role`: Allows ECS tasks to pull images from ECR and push logs to CloudWatch.
- **ECS Cluster**: The logical grouping of tasks and services.
- **Launch Template & ASG**:
  - **Launch Template**: Defines the EC2 instance configuration (AMI, instance type `t3.micro`, security groups, user data to register with cluster).
  - **Auto Scaling Group (ASG)**: Manages the EC2 instances. Currently set to a fixed size of 1 instance.
- **Capacity Provider**: Links the ASG to the ECS cluster, allowing ECS to manage the infrastructure scaling (though currently fixed).
- **Task Definition**: Describes the application.
  - Defines two containers: `app` (Laravel) and `web` (Nginx).
  - **Environment Variables**: Injects DB credentials and API keys into the `app` container.
  - **Volumes**: Mounts the EFS file system to `/var/www/html/storage/app` for persistent storage.
  - **Logging**: Configures CloudWatch Logs (`awslogs`) for centralized logging.
- **ECS Service**: Runs and maintains the specified number of task instances (1) based on the Task Definition. It handles deployments (rolling updates).

## 2. Resource Relationships

1.  **VPC & Networking**: The **VPC** contains all resources. **Subnets** host the EC2 instances (ECS) and RDS. **Security Groups** act as firewalls, allowing traffic flow: `Internet -> ECS (HTTP) -> RDS (SQL)`.
2.  **ECS & EC2**: The **ECS Cluster** manages tasks. The **Auto Scaling Group** launches **EC2 Instances** using the **Launch Template**. These instances run the ECS Agent and register themselves with the cluster.
3.  **Task & Containers**: The **Task Definition** specifies that `app` and `web` containers run together. `web` (Nginx) proxies requests to `app` (PHP-FPM) on port 9000.
4.  **Storage**:
    - **RDS**: The `app` container connects to the **RDS Instance** using credentials passed via environment variables.
    - **EFS**: The **EFS File System** is mounted to the EC2 instances and then mapped into the `app` and `web` containers, ensuring files in `storage/app` persist even if containers restart.
5.  **Images**: ECS pulls Docker images from **ECR Repositories**.

## 3. Deployment Guide

Follow these steps to deploy the infrastructure to AWS.

### Prerequisites

- AWS CLI installed and configured (`aws configure`).
- Terraform installed.
- Docker installed (for building images).

### Step 1: Initialize Terraform

Initialize the working directory. This downloads the AWS provider plugins.

```bash
cd terra
terraform init
```

### Step 2: Create Infrastructure (First Run)

Apply the configuration to create the ECR repositories and other base resources.

```bash
terraform apply -auto-approve
```

_Note: The first run might fail to start the ECS service if images haven't been pushed to ECR yet. This is normal._

### Step 3: Build and Push Docker Images

Use the provided PowerShell script to build and push images to the created ECR repositories.

```powershell
# From the project root
./build_and_push.ps1
```

_Make sure to update the image tags in `terra/ecs.tf` with the new tags generated by this script (e.g., `v-20251129-xxxx`)._

### Step 4: Update Image Tags and Deploy

If you updated image tags in `ecs.tf`, apply Terraform again to update the ECS Task Definition and trigger a deployment.

```bash
cd terra
terraform apply -auto-approve
```

## 4. AWS CLI Status Checks

Use these commands to check the status of your resources.

### Check ECS Service Status

Verify if the service is active and tasks are running.

```bash
aws ecs describe-services --cluster dinggo-cluster --services dinggo-service --region ap-southeast-2
```

_Look for `status: ACTIVE`, `runningCount: 1`, and `rolloutState: COMPLETED`._

### List Running Tasks

See the specific tasks running in the cluster.

```bash
aws ecs list-tasks --cluster dinggo-cluster --region ap-southeast-2
```

### Check Task Details (including errors)

Replace `YOUR_TASK_ID` with an ID from the previous command.

```bash
aws ecs describe-tasks --cluster dinggo-cluster --tasks YOUR_TASK_ID --region ap-southeast-2
```

_Check the `containers` section for `lastStatus: RUNNING` and any `exitCode` or `reason` if stopped._

### Check EC2 Instances

Confirm the EC2 instance is running.

```bash
aws ec2 describe-instances --filters "Name=tag:Name,Values=dinggo-ecs-instance" --region ap-southeast-2
```

### Check RDS Status

Verify the database is available.

```bash
aws rds describe-db-instances --db-instance-identifier dinggo-db --region ap-southeast-2
```

_Look for `DBInstanceStatus: available`._
