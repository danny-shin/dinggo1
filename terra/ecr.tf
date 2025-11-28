resource "aws_ecr_repository" "app" {
  name                 = "${var.project_name}-app"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = false # Save costs/time for free tier, though scanning is often free/cheap
  }

  tags = {
    Name = "${var.project_name}-app-repo"
  }
}

output "ecr_repository_url" {
  description = "The URL of the App ECR repository"
  value       = aws_ecr_repository.app.repository_url
}

resource "aws_ecr_repository" "nginx" {
  name                 = "${var.project_name}-nginx"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = false
  }

  tags = {
    Name = "${var.project_name}-nginx-repo"
  }
}

output "nginx_repository_url" {
  description = "The URL of the Nginx ECR repository"
  value       = aws_ecr_repository.nginx.repository_url
}
