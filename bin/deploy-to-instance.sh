#!/bin/bash
# Manual deployment script for Lightsail instance
# Similar to portfolio-next/bin/build-with-push.sh

set -e

echo "=================================="
echo "Manual Deployment to Lightsail"
echo "=================================="
echo ""

# Configuration
INSTANCE_IP=${LIGHTSAIL_INSTANCE_IP:-""}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-""}
ECR_REPO="superhero-ttrpg-ecr-repo"
AWS_REGION=${AWS_REGION:-"us-east-1"}

# Check required variables
if [ -z "$INSTANCE_IP" ]; then
    read -p "Enter Lightsail instance IP: " INSTANCE_IP
fi

if [ -z "$AWS_ACCOUNT_ID" ]; then
    read -p "Enter AWS Account ID: " AWS_ACCOUNT_ID
fi

ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_NAME="${ECR_REGISTRY}/${ECR_REPO}:latest"

echo "Configuration:"
echo "  Instance IP: $INSTANCE_IP"
echo "  ECR Registry: $ECR_REGISTRY"
echo "  Image: $IMAGE_NAME"
echo ""

# Step 1: Build Docker image
echo "Step 1: Building Docker image..."
docker build -t superhero-ttrpg:latest .
docker tag superhero-ttrpg:latest $IMAGE_NAME
echo "✅ Image built"
echo ""

# Step 2: Login to ECR
echo "Step 2: Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ECR_REGISTRY
echo "✅ ECR login successful"
echo ""

# Step 3: Push to ECR
echo "Step 3: Pushing image to ECR..."
docker push $IMAGE_NAME
echo "✅ Image pushed"
echo ""

# Step 4: Deploy to instance
echo "Step 4: Deploying to Lightsail instance..."
ssh ubuntu@$INSTANCE_IP << ENDSSH
  set -e
  cd /opt/superhero-ttrpg
  
  echo "Logging in to ECR..."
  aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin $ECR_REGISTRY
  
  echo "Pulling latest image..."
  docker-compose pull
  
  echo "Restarting containers..."
  docker-compose down
  docker-compose up -d
  
  echo "Cleaning up old images..."
  docker image prune -a -f
  
  echo "Reloading nginx..."
  sudo nginx -t && sudo systemctl reload nginx
  
  echo "✅ Deployment complete!"
ENDSSH

echo ""
echo "=================================="
echo "✅ Deployment Successful!"
echo "=================================="
echo ""
echo "Verify at: http://$INSTANCE_IP:3000/api/health"