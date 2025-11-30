variable "region" {
  description = "AWS Region"
  default     = "ap-southeast-2"	
}

variable "project_name" {
  description = "Project Name"
  default     = "dinggo"
}

variable "vpc_cidr" {
  description = "VPC CIDR Block"
  default     = "10.0.0.0/16"
}

variable "db_name" {
  description = "Database Name"
  default     = "dinggo"
}

variable "db_username" {
  description = "Database Username"
  default     = "dinggo"
}

variable "db_password" {
  description = "Database Password"
  type        = string
  sensitive   = true
}

variable "dinggo_api_user" {
  description = "DingGo API User"
  default     = "daniel.dongsoo.shin@gmail.com"
}

variable "dinggo_api_key" {
  description = "DingGo API Key"
  default     = "daniel.dongsoo.shin"
}

variable "dinggo_api_url" {
  description = "DingGo API URL"
  default     = "https://app.dev.aws.dinggo.com.au/phptest"
}

variable "app_env" {
  description = "APP_ENV"
  default     = "<AWS>"
}
