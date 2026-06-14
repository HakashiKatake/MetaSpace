output "public_ip" {
  value = aws_instance.app.public_ip
}

output "public_dns" {
  value = aws_instance.app.public_dns
}

output "ec2_security_group_id" {
  value = aws_security_group.ec2.id
}

output "instance_id" {
  value = aws_instance.app.id
}
