# Royal Mail Track 💌

_**Saturday Morning Breakfast Coding!**_ Get SMS updates from Royal Mail for any changes to a package.

**NOTE:** I hacked this together on a Saturday morning to track a parcel. It's not guaranteed to work,
but it's here for reference if you want to have a crack at it!

You will need:

 1. AWS Account and Lambda Role with:
      - Access to S3
      - Access to SNS
 2. NodeJS
 3. [Node-Lambda](https://www.npmjs.com/package/node-lambda)
 
## Installation

Clone the repository and install node-lambda (`npm install -g node-lambda`)

Configure your `deploy.env` file with the following keys:

    TRACK_NUMBER=FR...GB
    NOTIFY_MOBILE=+44...
    S3_BUCKET=...
  
These are:
 
  - `TRACK_NUMBER` - The royal mail tracking number
  - `NOTIFY_MOBILE` - The mobile number to send a text to
  - `S3_BUCKET` - The S3 bucket to stre state in

(You'll need these in `.env`, too, for testing locally.)

Configure your `.env` file with the region, key and secret as per your AWS security credentials.

## Test Locally

To test locally, run `npm run start`

## Deployment

Deploy to Lambda by running `npm run deploy-production`

## Running

The best way to run this is to set up a CloudWatch Schedule on a regular interval. 
The Lambda function will run on this interval and send an SMS to the configured
mobile number only when there's a change on the tracking page on the Royal Mail site.
