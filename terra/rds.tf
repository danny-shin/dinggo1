resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = [aws_subnet.public_1.id, aws_subnet.public_2.id]

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

resource "aws_db_instance" "main" {
  identifier        = "${var.project_name}-db"
  engine            = "postgres"
  engine_version    = "16.6" # Check available versions, 16 is usually fine
  instance_class    = "db.t3.micro"
  # allocated_storage = 20
  allocated_storage = 10 
  storage_type      = "gp2"

  # in Prod, AWS runs two copies of your database simultaneously. 
  # One in Subnet A (Primary) and one in Subnet B (Standby). 
  # If Primary dies, AWS automatically switches to Standby. 
  # This is physically impossible without two subnets.
  # multi_az = true   default false

  db_name  = "dinggo"
  username = "dinggo"
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  skip_final_snapshot = true
  publicly_accessible = false # Keep it internal to VPC even if in public subnet

  tags = {
    Name = "${var.project_name}-db"
  }
}
