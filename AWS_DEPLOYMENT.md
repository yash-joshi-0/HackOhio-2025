# AWS Deployment Guide for Protothought

This guide covers deploying the Protothought application to AWS using various services.

## Architecture Overview

The application consists of:
- **Frontend**: React application (Nginx container)
- **Backend**: Express.js API server
- **Database**: PostgreSQL database
- **LLM Service**: TinyLlama 1.1B model service

## Deployment Options

### Option 1: AWS ECS (Elastic Container Service) with Fargate

This is the recommended approach for containerized applications.

#### Prerequisites
- AWS CLI installed and configured
- Docker installed locally
- AWS account with appropriate permissions

#### Step 1: Create ECR Repositories

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Create repositories
aws ecr create-repository --repository-name protothought-frontend --region us-east-1
aws ecr create-repository --repository-name protothought-backend --region us-east-1
aws ecr create-repository --repository-name protothought-llm --region us-east-1
```

#### Step 2: Build and Push Docker Images

```bash
# Build images
docker-compose build

# Tag images
docker tag protothought-frontend:latest <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/protothought-frontend:latest
docker tag protothought-backend:latest <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/protothought-backend:latest
docker tag protothought-llm:latest <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/protothought-llm:latest

# Push images
docker push <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/protothought-frontend:latest
docker push <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/protothought-backend:latest
docker push <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/protothought-llm:latest
```

#### Step 3: Set Up RDS PostgreSQL Database

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
    --db-instance-identifier protothought-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username admin \
    --master-user-password <YOUR_SECURE_PASSWORD> \
    --allocated-storage 20 \
    --region us-east-1
```

#### Step 4: Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name protothought-cluster --region us-east-1
```

#### Step 5: Create Task Definitions

Create `ecs-task-definition.json`:

```json
{
  "family": "protothought-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "3072",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "<YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/protothought-frontend:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "essential": true
    },
    {
      "name": "backend",
      "image": "<YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/protothought-backend:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "POSTGRES_USER",
          "value": "admin"
        },
        {
          "name": "POSTGRES_PASSWORD",
          "value": "<YOUR_SECURE_PASSWORD>"
        },
        {
          "name": "POSTGRES_DB",
          "value": "protothought"
        },
        {
          "name": "DB_HOST",
          "value": "<YOUR_RDS_ENDPOINT>"
        },
        {
          "name": "PORT",
          "value": "5000"
        }
      ],
      "essential": true
    },
    {
      "name": "llm",
      "image": "<YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/protothought-llm:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "essential": true
    }
  ]
}
```

Register the task definition:
```bash
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
```

#### Step 6: Create Application Load Balancer

```bash
# Create load balancer
aws elbv2 create-load-balancer \
    --name protothought-alb \
    --subnets <SUBNET_ID_1> <SUBNET_ID_2> \
    --security-groups <SECURITY_GROUP_ID> \
    --region us-east-1

# Create target groups
aws elbv2 create-target-group \
    --name protothought-frontend-tg \
    --protocol HTTP \
    --port 80 \
    --vpc-id <YOUR_VPC_ID> \
    --target-type ip
```

#### Step 7: Create ECS Service

```bash
aws ecs create-service \
    --cluster protothought-cluster \
    --service-name protothought-service \
    --task-definition protothought-app \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[<SUBNET_ID_1>,<SUBNET_ID_2>],securityGroups=[<SECURITY_GROUP_ID>],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=<TARGET_GROUP_ARN>,containerName=frontend,containerPort=80"
```

---

### Option 2: AWS EC2 with Docker Compose

For a simpler deployment using a single EC2 instance:

#### Step 1: Launch EC2 Instance

1. Launch an EC2 instance (t3.medium or larger recommended for LLM service)
2. Choose Amazon Linux 2 or Ubuntu AMI
3. Configure security group to allow:
   - Port 22 (SSH)
   - Port 80 (HTTP)
   - Port 443 (HTTPS)

#### Step 2: Install Docker and Docker Compose

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@<EC2_PUBLIC_IP>

# Install Docker
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Step 3: Clone Repository and Deploy

```bash
# Clone your repository
git clone <YOUR_REPO_URL>
cd HackOhio-2025

# Create .env file
cat > .env << EOF
POSTGRES_USER=protothought_user
POSTGRES_PASSWORD=<YOUR_SECURE_PASSWORD>
POSTGRES_DB=protothought
EOF

# Start services
docker-compose up -d
```

---

### Option 3: AWS Amplify + Lambda + RDS

For a serverless approach:

- Deploy frontend to AWS Amplify
- Convert backend to AWS Lambda functions using AWS API Gateway
- Use RDS for PostgreSQL
- Deploy LLM service on EC2 or use AWS SageMaker

---

## Environment Variables

Make sure to set these environment variables in production:

```
POSTGRES_USER=<db_username>
POSTGRES_PASSWORD=<secure_password>
POSTGRES_DB=protothought
DB_HOST=<rds_endpoint or db container name>
PORT=5000
LLM_SERVICE_URL=http://llm:8000
```

## Monitoring and Logging

- Set up CloudWatch for logs and metrics
- Configure CloudWatch Alarms for critical metrics
- Use AWS X-Ray for distributed tracing

## Scaling Considerations

- **Frontend**: Can scale horizontally with ALB
- **Backend**: Can scale horizontally with ECS task count
- **LLM Service**: Requires GPU instances (p3.2xlarge) for better performance, or use CPU-based instances (t3.xlarge)
- **Database**: Use RDS read replicas for read-heavy workloads

## Cost Optimization

- Use Fargate Spot for non-critical workloads
- Set up auto-scaling based on CPU/memory metrics
- Use CloudWatch to monitor and optimize resource usage
- Consider Reserved Instances or Savings Plans for long-term deployments

## Security Best Practices

1. Use AWS Secrets Manager for sensitive credentials
2. Enable VPC for network isolation
3. Use IAM roles with least privilege
4. Enable SSL/TLS for all communications
5. Regular security updates for containers
6. Enable AWS WAF for DDoS protection

## Backup and Disaster Recovery

- Enable automated RDS backups
- Store container images in multiple regions
- Document recovery procedures
- Test backup restoration regularly

## CI/CD Pipeline

Consider setting up automated deployments using:
- AWS CodePipeline
- GitHub Actions
- GitLab CI/CD
- Jenkins

Example GitHub Actions workflow included in `.github/workflows/deploy.yml`
