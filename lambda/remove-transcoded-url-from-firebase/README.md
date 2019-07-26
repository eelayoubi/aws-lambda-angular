# Transcoded video URL from Firebase

This function updates a Firebase database entry by  removing the deleted video from the transcoded S3 bucket.

## Environment variables
- SERVICE_ACCOUNT
- DATABASE_URL

## Deployment

### Prerequisites
This function requires an S3 transcoded bucket and a Firebase account

### Deployment steps
1. Run "npm install" to install dependencies
2. Run "npm run predeploy" to package the function into a zip file
3. Upload it the resulting Lambda-Deployment.zip using the AWS Lambda Console
4. Create an S3 trigger from the transcoded bucket
