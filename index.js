'use strict';

require('dotenv').config({ silent: true });

const request = require('request-promise');
const cheerio = require('cheerio');
const AWS = require('aws-sdk');

const trackNumber = process.env.TRACK_NUMBER || console.error('No tracking number configured');
const notifyMobile = process.env.NOTIFY_MOBILE || console.error('No mobile number configured');
const s3BucketName = process.env.S3_BUCKET || console.error('No S3 bucket configured');

const s3Bucket = new AWS.S3({ params: { Bucket: s3BucketName }});
const sns = new AWS.SNS();

const sms = (tel, msg) => {
    const params = {
        Message: msg,
        MessageStructure: 'string',
        PhoneNumber: tel
    };
    sns.publish(params, (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(data);
    });
};

const load = () => {
    return new Promise((resolve) => {
        s3Bucket.getObject({ Key: 'config' }, (err, data) => {
            if (err) {
                console.error(err);
                resolve({
                    prevStatusUpdate: null,
                    prevStatusText: null
                });
                return;
            }
            resolve(JSON.parse(data.Body.toString()));
            return;
        });
    });
};

const save = (config) => {
    return new Promise((resolve, reject) => {
        s3Bucket.upload({ Key: 'config', Body: JSON.stringify(config) }, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
            return;
        });
    });
};

const getUpdates = () => {
    load().then(config => {
        console.log(config);
        let prevStatusText = config.prevStatusText;
        let prevStatusUpdate = config.prevStatusUpdate;
        request(`https://www.royalmail.com/track-your-item?trackNumber=${trackNumber}`)
            .then(resp => {
                const $ = cheerio.load(resp);
                const status = $(`#${trackNumber} .status p`).map((i, elem) => $(elem).text()).get();
                const statusUpdate = status[0];
                const statusText = status[1];
                if (prevStatusText && prevStatusUpdate &&
                    (prevStatusText !== statusText || prevStatusUpdate !== statusUpdate)) {
                    sms(notifyMobile, statusUpdate + '\n' + statusText);
                }
                save({ prevStatusText: statusText, prevStatusUpdate: statusUpdate })
                    .then(() => console.log('saved'))
                    .catch(err => console.error(err));
            });

    }).catch(err => console.error(err));
}

exports.handler = getUpdates;
