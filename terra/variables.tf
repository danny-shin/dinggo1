variable "region" {
  description = "AWS Region"
  default     = "ap-southeast-2"	
}

variable "project_name" {
  description = "Project Name"
  default     = "dinggo"
}

variable "db_password" {
  description = "Database Password"
  type        = string
  sensitive   = true
}

variable "vpc_cidr" {
  description = "VPC CIDR Block"
  default     = "10.0.0.0/16"
}
