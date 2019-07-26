# S3 Policy creator

This function will delete an S3 object.

## Environment variables
- S3_TRANSCODED_BUCKET_NAME


## Deployment

### Prerequisites
This function requires an IAM upload user and S3 upload bucket

### Deployment steps
1. Run "npm install" to install dependencies
2. Run "npm run predeploy" to package the function into a zip file
3. Upload it the resulting Lambda-Deployment.zip using the AWS Lambda Console
