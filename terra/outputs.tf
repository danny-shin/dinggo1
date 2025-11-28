output "rds_endpoint" {
  description = "The endpoint of the RDS database"
  value       = aws_db_instance.main.address
}

output "ecs_cluster_name" {
  description = "The name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "instructions" {
  description = "Instructions for next steps"
  value       = <<EOF
1. Build and push your Docker images to ECR (or Docker Hub) and update the image URLs in 'ecs.tf'.
2. Run 'terraform init' to initialize.
3. Run 'terraform apply' to deploy.
4. After deployment, find your EC2 instance Public IP in the AWS Console (EC2 -> Instances) to access the app.
EOF
}
