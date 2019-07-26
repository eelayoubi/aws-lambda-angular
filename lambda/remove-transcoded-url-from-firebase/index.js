'use strict';

/**
 * Required Env Vars:
 * DATABASE_URL
 */

const firebase = require('firebase-admin');
const serviceAccount = require(`./key.json`);

// save the URL to firebase
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL
});

const handler = (event, context, callback) => {

    context.callbackWaitsForEmptyEventLoop = false;
    const key = event.Records[0].s3.object.key;

    // get the unique video key (the folder name)
    const childName = key.split('/')[0];

    const database = firebase.database().ref();

    // update the unique entry for this video in firebase
    return database.child('videos').child(childName).remove()
        .then(() => {
            callback(null, `child removed ${childName}`);
        })
        .catch((err) => {
            callback(err);
        });
};

module.exports = {
    handler
};