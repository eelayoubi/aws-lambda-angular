'use strict';

/**
 * Required Env Vars:
 * ELASTIC_TRANSCODER_REGION
 * ELASTIC_TRANSCODER_PIPELINE_ID
 * DATABASE_URL
 */


const AWS = require('aws-sdk');
const firebase = require('firebase-admin');
const serviceAccount = require(`./key.json`);

const elasticTranscoder = new AWS.ElasticTranscoder({
    region: process.env.ELASTIC_TRANSCODER_REGION
});

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL
});

const generateTranscoderParams = (sourceKey, outputKey, transcoderPipelineID) => {
    const params = {
        PipelineId: transcoderPipelineID,
        OutputKeyPrefix: outputKey + '/',
        Input: {
            Key: sourceKey
        },
        Outputs: [
            {
                Key: outputKey + '-web-480p' + '.mp4',
                PresetId: '1351620000001-000020' //480p 16:9 format
            }
        ]
    };

    return params;
};

const pushVideoEntryToFirebase = (key) => {
    console.log("Adding video entry to firebase at key:", key);

    const database = firebase.database().ref();

    // create a unique entry for this video in firebase
    return database.child('videos').child(key)
        .set({
            transcoding: true
        });
};

const handler = (event, context, callback) => {

    context.callbackWaitsForEmptyEventLoop = false;
    const pipelineID = process.env.ELASTIC_TRANSCODER_PIPELINE_ID;

    const key = event.Records[0].s3.object.key;
    console.log("Object key:", key);

    const regex = /.(?=mp4)|.(?=mov)|.(?=avi)$/;
    const supportedFormat = ['mov', 'mp4', 'avi']
    // The input file may have spaces so replace them with '+'
    const sourceKey = decodeURIComponent(key.replace(/\s+/g, '+'));
    console.log("Source key:", sourceKey);

    // Remove the file extension
    const resName = sourceKey.split(regex);

    if (resName.length === 0 || !supportedFormat.includes(resName[1])) {
        // Failure
        console.log('Unsupported format ...');
        callback(new Error('Unsupported video format ...'));
        return;
    }
    const outputKey = resName[0];

    // get the unique video key (the folder name)
    const uniqueVideoKey = outputKey.split('/')[0];

    const params = generateTranscoderParams(sourceKey, outputKey, pipelineID);

    return elasticTranscoder.createJob(params)
        .promise()
        .then((data) => {
            // the transcoding job started, so let's make a record in firebase
            // that the UI can show right away
            console.log("Elastic transcoder job created successfully");
            return pushVideoEntryToFirebase(uniqueVideoKey);
        })
        .then(() => {
            callback(null, 'Video Saved');
        })
        .catch((error) => {
            console.log("Error creating elastic transcoder job.");
            callback(error);
        });
};


module.exports = {
    handler
};