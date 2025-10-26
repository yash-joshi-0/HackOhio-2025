# Terraform AWS Infrastructure

This directory contains Terraform configuration for deploying Protothought infrastructure to AWS.

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) >= 1.0
- AWS CLI configured with appropriate credentials
- An AWS account with necessary permissions

## Quick Start

1. **Initialize Terraform**
   ```bash
   cd terraform
   terraform init
   ```

2. **Create terraform.tfvars**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

3. **Review the planned changes**
   ```bash
   terraform plan
   ```

4. **Apply the infrastructure**
   ```bash
   terraform apply
   ```

5. **Note the outputs**
   After successful apply, Terraform will output important values like:
   - ALB DNS name (where your app will be accessible)
   - RDS endpoint
   - ECR repository URLs

## What Gets Created

This Terraform configuration creates:

- **VPC** with public subnets across 2 availability zones
- **Internet Gateway** for internet access
- **Security Groups** for ALB, ECS tasks, and RDS
- **RDS PostgreSQL** database instance
- **ECR Repositories** for Docker images (frontend, backend, LLM)
- **ECS Cluster** for running containers
- **Application Load Balancer** for routing traffic
- **IAM Roles** for ECS task execution
- **CloudWatch Log Groups** for application logs

## Variables

| Variable | Description | Default |
|----------|-------------|---------|
| aws_region | AWS region to deploy to | us-east-1 |
| db_name | Database name | protothought |
| db_username | Database username | (required) |
| db_password | Database password | (required) |
| db_instance_class | RDS instance type | db.t3.micro |

## After Infrastructure is Created

1. Build and push Docker images to ECR (see AWS_DEPLOYMENT.md)
2. Create ECS task definition with your container images
3. Create ECS service to run the tasks
4. Access your application via the ALB DNS name

## Cleanup

To destroy all created resources:

```bash
terraform destroy
```

**Warning**: This will delete all resources including the database. Make sure to backup any important data first.

## Estimated Costs

With default settings (db.t3.micro, minimal traffic):
- RDS: ~$15/month
- ECS Fargate: Varies by usage, ~$30-50/month for small workloads
- ALB: ~$16/month + data transfer
- ECR: First 500MB free, then $0.10/GB/month

Total estimated: ~$60-80/month for development/testing

For production, consider using larger instances and reserved capacity for cost savings.

## Security Notes

- Never commit `terraform.tfvars` with real credentials
- Use AWS Secrets Manager for production credentials
- Enable MFA for AWS account
- Regularly rotate database passwords
- Review and update security group rules

## Troubleshooting

**Issue**: Terraform can't find credentials
- Solution: Run `aws configure` or set AWS environment variables

**Issue**: Resource already exists
- Solution: Import existing resources or use different names

**Issue**: Database creation fails
- Solution: Check password meets PostgreSQL requirements (8+ chars)

For more help, see the [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
