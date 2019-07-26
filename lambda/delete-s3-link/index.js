'use strict';

/**
 *
 * Required Env Vars:
 * S3_TRANSCODED_BUCKET_NAME: YOUR_TRANSCODED_BUCKET_NAME_HERE
 */

const AWS = require('aws-sdk');
const s3 = new AWS.S3({ signatureVersion: 'v4' });

const generateResponse = (status, message) => {
    return {
        statusCode: status,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(message)
    }
};

async function emptyS3Directory(bucket, dir) {
    const listParams = {
        Bucket: bucket,
        Prefix: dir
    };
    const listedObjects = await s3.listObjectsV2(listParams).promise();

    if (listedObjects.Contents.length === 0) return;

    const deleteParams = {
        Bucket: bucket,
        Delete: { Objects: [] }
    };

    listedObjects.Contents.forEach(({ Key }) => {
        deleteParams.Delete.Objects.push({ Key });
    });

    await s3.deleteObjects(deleteParams).promise();

    if (listedObjects.IsTruncated) await emptyS3Directory(bucket, dir);
}

const handler = (event, context, callback) => {

    const bucket = process.env.S3_TRANSCODED_BUCKET_NAME;
    if (!bucket) {
        callback('No upload bucket set, please add an output bucket in the environment variables');
        return;
    }

    const directoryName = event.queryStringParameters.directoryName + '/';

    if (!directoryName) {
        callback('No directoryName found');
        return;
    }
    emptyS3Directory(bucket, directoryName)
        .then(data => {
            // Success
            const response = generateResponse(200, data);
            callback(null, response);
        })
        .catch((error) => {
            // Failure
            const response = generateResponse(400, error);
            callback(null, response);
        });
};

module.exports = {
    handler
};
