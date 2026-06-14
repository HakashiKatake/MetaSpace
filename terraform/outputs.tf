output "ec2_public_ip"      { value = module.ec2.public_ip }
output "ec2_public_dns"     { value = module.ec2.public_dns }
output "ec2_instance_id"    { value = module.ec2.instance_id }
output "rds_endpoint"       { value = module.rds.endpoint }
output "s3_bucket_name"     { value = module.s3.bucket_name }
output "vpc_id"             { value = module.vpc.vpc_id }
