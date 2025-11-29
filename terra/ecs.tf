# --- IAM Roles ---

# ECS Instance Role (for the EC2 instance)
resource "aws_iam_role" "ecs_instance_role" {
  name = "${var.project_name}-ecs-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_instance_role_policy" {
  role       = aws_iam_role.ecs_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ecs_instance_profile" {
  name = "${var.project_name}-ecs-instance-profile"
  role = aws_iam_role.ecs_instance_role.name
}

# ECS Task Execution Role (for pulling images, logs, etc.)
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.project_name}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# --- ECS Cluster ---

resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"
}

# --- EC2 Launch Template & ASG ---

# Get latest ECS Optimized AMI
data "aws_ssm_parameter" "ecs_optimized_ami" {
  name = "/aws/service/ecs/optimized-ami/amazon-linux-2/recommended/image_id"
}

resource "aws_launch_template" "ecs_lt" {
  name_prefix   = "${var.project_name}-ecs-lt-"
  image_id      = data.aws_ssm_parameter.ecs_optimized_ami.value
  instance_type = "t3.micro"

  iam_instance_profile {
    name = aws_iam_instance_profile.ecs_instance_profile.name
  }

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.ecs_sg.id]
  }

  user_data = base64encode(<<-EOF
              #!/bin/bash
              echo ECS_CLUSTER=${aws_ecs_cluster.main.name} >> /etc/ecs/ecs.config
              EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "${var.project_name}-ecs-instance"
    }
  }
}

resource "aws_autoscaling_group" "ecs_asg" {
  name                = "${var.project_name}-asg"
  vpc_zone_identifier = [aws_subnet.public_1.id, aws_subnet.public_2.id]
  launch_template {
    id      = aws_launch_template.ecs_lt.id
    version = "$Latest"
  }

  min_size         = 1
  max_size         = 1
  desired_capacity = 1

  tag {
    key                 = "AmazonECSManaged"
    value               = true
    propagate_at_launch = true
  }
}

# --- Capacity Provider ---

resource "aws_ecs_capacity_provider" "ecs_cp" {
  name = "${var.project_name}-cp"

  auto_scaling_group_provider {
    auto_scaling_group_arn = aws_autoscaling_group.ecs_asg.arn
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = [aws_ecs_capacity_provider.ecs_cp.name]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = aws_ecs_capacity_provider.ecs_cp.name
  }
}

# --- Task Definition ---

resource "aws_ecs_task_definition" "app" {
  family             = "${var.project_name}-task"
  network_mode       = "bridge"
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  cpu                = "256" # t3.micro has 2 vCPUs, but we limit task
  memory             = "512" # t3.micro has 1GB

  volume {
    name = "storage_app"
    efs_volume_configuration {
      file_system_id = aws_efs_file_system.main.id
      root_directory = "/"
    }
  }

  container_definitions = jsonencode([
    {
      name      = "app"
      image     = "940663608218.dkr.ecr.ap-southeast-2.amazonaws.com/dinggo-app:v-20251129-1324"
      cpu       = 128
      memory    = 256
      essential = true
      environment = [
        { name = "DB_HOST", value = aws_db_instance.main.address },
        { name = "DB_DATABASE", value = aws_db_instance.main.db_name },
        { name = "DB_USERNAME", value = aws_db_instance.main.username },
        { name = "DB_PASSWORD", value = var.db_password },
        { name = "DINGGO_API_USER", value = var.dinggo_api_user },
        { name = "DINGGO_API_KEY", value = var.dinggo_api_key },
        { name = "DINGGO_API_URL", value = var.dinggo_api_url }
      ]
      mountPoints = [
        {
          sourceVolume  = "storage_app"
          containerPath = "/var/www/html/storage/app"
          readOnly      = false
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.project_name}"
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = "app"
          "awslogs-create-group"  = "true"
        }
      }
    },
    {
      name      = "web"
      image     = "940663608218.dkr.ecr.ap-southeast-2.amazonaws.com/dinggo-nginx:v-20251129-1324"
      cpu       = 128
      memory    = 128
      essential = true
      links     = ["app"] # Link to app container
      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
          protocol      = "tcp"
        }
      ]
      mountPoints = [
        {
          sourceVolume  = "storage_app"
          containerPath = "/var/www/html/storage/app"
          readOnly      = false
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.project_name}"
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = "web"
          "awslogs-create-group"  = "true"
        }
      }
      # Note: Nginx config needs to point to 'app:9000' which works via links
    }
  ])
}

# --- ECS Service ---

resource "aws_ecs_service" "main" {
  name            = "${var.project_name}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 1

  capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.ecs_cp.name
    weight            = 100
  }

  deployment_minimum_healthy_percent = 0
  deployment_maximum_percent         = 100
}
