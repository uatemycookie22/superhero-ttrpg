#!/bin/bash
# Setup script for Lightsail instance deployment

set -e

echo "=================================="
echo "Superhero TTRPG - Lightsail Setup"
echo "=================================="
echo ""

# Check for required tools
command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI not installed. Install from: https://aws.amazon.com/cli/"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker not installed"; exit 1; }

echo "✅ Prerequisites check passed"
echo ""

# Get user input
read -p "Enter your AWS Account ID: " AWS_ACCOUNT_ID
read -p "Enter AWS Region [us-east-1]: " AWS_REGION
AWS_REGION=${AWS_REGION:-us-east-1}
read -p "Enter Lightsail instance name [superhero-ttrpg-instance]: " INSTANCE_NAME
INSTANCE_NAME=${INSTANCE_NAME:-superhero-ttrpg-instance}

ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
ECR_REPO="superhero-ttrpg"

echo ""
echo "Configuration:"
echo "  Account ID: $AWS_ACCOUNT_ID"
echo "  Region: $AWS_REGION"
echo "  Instance: $INSTANCE_NAME"
echo "  ECR: $ECR_REGISTRY/$ECR_REPO"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo ""
echo "Step 1: Creating ECR repository..."
aws ecr create-repository \
  --repository-name $ECR_REPO \
  --region $AWS_REGION \
  2>/dev/null || echo "⚠️  Repository already exists"

echo "✅ ECR repository ready"
echo ""

echo "Step 2: Building Docker image..."
docker build -t $ECR_REPO:latest .

echo "✅ Image built"
echo ""

echo "Step 3: Pushing to ECR..."
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ECR_REGISTRY

docker tag $ECR_REPO:latest $ECR_REGISTRY/$ECR_REPO:latest
docker push $ECR_REGISTRY/$ECR_REPO:latest

echo "✅ Image pushed to ECR"
echo ""

echo "Step 4: Creating Lightsail instance..."
aws lightsail create-instances \
  --instance-names $INSTANCE_NAME \
  --availability-zone ${AWS_REGION}a \
  --blueprint-id ubuntu_24_04 \
  --bundle-id micro_3_0 \
  2>/dev/null || echo "⚠️  Instance already exists"

echo "⏳ Waiting for instance to be running..."
sleep 30

INSTANCE_IP=$(aws lightsail get-instance \
  --instance-name $INSTANCE_NAME \
  --query 'instance.publicIpAddress' \
  --output text)

echo "✅ Instance created at: $INSTANCE_IP"
echo ""

echo "Step 5: Open required ports..."
aws lightsail open-instance-public-ports \
  --instance-name $INSTANCE_NAME \
  --port-info fromPort=3000,toPort=3000,protocol=TCP \
  2>/dev/null || echo "⚠️  Port already open"

aws lightsail open-instance-public-ports \
  --instance-name $INSTANCE_NAME \
  --port-info fromPort=80,toPort=80,protocol=TCP \
  2>/dev/null || echo "⚠️  Port already open"

echo "✅ Ports opened: 3000 (app), 80 (http)"
echo ""

echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo ""
echo "1. SSH to instance and configure:"
echo "   ssh -i ~/.ssh/your-key.pem ubuntu@$INSTANCE_IP"
echo ""
echo "2. On the instance, run:"
echo "   sudo apt-get update && sudo apt-get install -y docker.io docker-compose-v2 awscli"
echo "   sudo usermod -aG docker ubuntu"
echo "   newgrp docker"
echo ""
echo "3. Create /opt/superhero-ttrpg/docker-compose.yml with:"
echo "   services:"
echo "     app:"
echo "       image: $ECR_REGISTRY/$ECR_REPO:latest"
echo "       ports:"
echo "         - \"3000:3000\""
echo "       volumes:"
echo "         - ./data:/app/data"
echo "       restart: unless-stopped"
echo ""
echo "4. Deploy:"
echo "   cd /opt/superhero-ttrpg"
echo "   aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY"
echo "   docker-compose pull"
echo "   docker-compose up -d"
echo ""
echo "5. Run migrations:"
echo "   docker-compose exec app npx drizzle-kit push"
echo ""
echo "6. Access app:"
echo "   http://$INSTANCE_IP:3000"
echo ""
echo "GitHub Actions will auto-deploy on every push to main!"