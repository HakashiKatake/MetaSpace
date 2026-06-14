variable "aws_region"    { default = "us-east-1" }
variable "environment"   { default = "dev" }
variable "project_name"  { default = "metaspace" }

variable "vpc_cidr"             { default = "10.0.0.0/16" }
variable "public_subnet_cidrs"  { default = ["10.0.1.0/24", "10.0.2.0/24"] }
variable "private_subnet_cidrs" { default = ["10.0.3.0/24", "10.0.4.0/24"] }

variable "ec2_instance_type" { default = "t3.micro" }
variable "ec2_ami"           {
  default = ""
  description = "Override AMI ID. If empty, the latest Ubuntu 22.04 LTS AMI will be fetched dynamically."
}

variable "db_instance_class" { default = "db.t3.micro" }
variable "db_name"           { default = "metaspace_db" }
variable "db_username"       { default = "metaspace_admin" }
variable "db_password"       {
  sensitive = true
  description = "RDS MySQL master password"
}

variable "key_pair_name" {
  description = "Name of existing EC2 Key Pair for SSH"
}
