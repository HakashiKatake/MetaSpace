#!/bin/bash
# scripts/setup-alarms.sh
# Set up CloudWatch alarms for EC2, RDS, and SNS notifications
set -euo pipefail

EC2_ID=${1:-}
RDS_ID=${2:-"metaspace-mysql"}
SNS_EMAIL=${3:-"your@email.com"}
REGION=${AWS_REGION:-"us-east-1"}

if [ -z "$EC2_ID" ]; then
  echo "Error: EC2 Instance ID is required as the first argument."
  exit 1
fi

echo "============================================"
echo " Setting up CloudWatch Alarms & SNS Alerting"
echo "============================================"

# SNS Topic for alerts (email notification)
echo "Creating SNS Topic..."
SNS_ARN=$(aws sns create-topic --name metaspace-alerts --region "$REGION" --query 'TopicArn' --output text)
echo "SNS Topic ARN: $SNS_ARN"

echo "Subscribing $SNS_EMAIL to topic..."
aws sns subscribe \
  --topic-arn "$SNS_ARN" \
  --protocol email \
  --notification-endpoint "$SNS_EMAIL" \
  --region "$REGION"

# Alarm 1: High CPU (> 80% for 5 min)
echo "Creating Alarm: MetaSpace-HighCPU..."
aws cloudwatch put-metric-alarm \
  --alarm-name "MetaSpace-HighCPU" \
  --alarm-description "EC2 CPU > 80% for 5 minutes" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --dimensions Name=InstanceId,Value="$EC2_ID" \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions "$SNS_ARN" \
  --treat-missing-data notBreaching \
  --region "$REGION"

# Alarm 2: Low Disk Space (< 20% free / > 80% used)
echo "Creating Alarm: MetaSpace-LowDisk..."
aws cloudwatch put-metric-alarm \
  --alarm-name "MetaSpace-LowDisk" \
  --alarm-description "Disk usage > 80%" \
  --metric-name disk_used_percent \
  --namespace MetaSpace/EC2 \
  --statistic Average \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions "$SNS_ARN" \
  --region "$REGION"

# Alarm 3: RDS High CPU
echo "Creating Alarm: MetaSpace-RDS-HighCPU..."
aws cloudwatch put-metric-alarm \
  --alarm-name "MetaSpace-RDS-HighCPU" \
  --alarm-description "RDS CPU > 75%" \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --statistic Average \
  --dimensions Name=DBInstanceIdentifier,Value="$RDS_ID" \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 75 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions "$SNS_ARN" \
  --region "$REGION"

# Alarm 4: RDS Low Storage
echo "Creating Alarm: MetaSpace-RDS-LowStorage..."
aws cloudwatch put-metric-alarm \
  --alarm-name "MetaSpace-RDS-LowStorage" \
  --alarm-description "RDS free storage < 2GB" \
  --metric-name FreeStorageSpace \
  --namespace AWS/RDS \
  --statistic Average \
  --dimensions Name=DBInstanceIdentifier,Value="$RDS_ID" \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 2000000000 \
  --comparison-operator LessThanThreshold \
  --alarm-actions "$SNS_ARN" \
  --region "$REGION"

echo "✅ CloudWatch Alarms and SNS subscription configured successfully!"
