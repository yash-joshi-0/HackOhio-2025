#!/bin/bash

# Deployment script for AWS EC2
# Usage: ./deploy-to-ec2.sh <EC2_IP_ADDRESS> <PEM_KEY_PATH>

set -e

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <EC2_IP_ADDRESS> <PEM_KEY_PATH>"
    exit 1
fi

EC2_IP=$1
PEM_KEY=$2

echo "Deploying to EC2 instance at $EC2_IP..."

# Create deployment package
echo "Creating deployment package..."
tar -czf deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='.env' \
    .

# Copy files to EC2
echo "Copying files to EC2..."
scp -i "$PEM_KEY" deploy.tar.gz ec2-user@"$EC2_IP":/home/ec2-user/

# SSH into EC2 and deploy
echo "Deploying application..."
ssh -i "$PEM_KEY" ec2-user@"$EC2_IP" << 'EOF'
    # Extract files
    cd /home/ec2-user
    rm -rf HackOhio-2025
    mkdir -p HackOhio-2025
    tar -xzf deploy.tar.gz -C HackOhio-2025
    cd HackOhio-2025

    # Stop existing containers
    docker-compose down || true

    # Pull latest images and rebuild
    docker-compose build --no-cache

    # Start services
    docker-compose up -d

    # Clean up
    docker system prune -f

    echo "Deployment complete!"
EOF

# Clean up local deployment package
rm deploy.tar.gz

echo "Application deployed successfully to $EC2_IP"
echo "Frontend should be accessible at http://$EC2_IP"
