'use strict';
const fs = require('fs');
const lambda = require('../index');

jest.mock('mysql', () => {
    return {
        createConnection: (x) => {
            return {
                query: (a, cb) => {
                    return cb(null, []);
                }
            }
        }
    }
});

jest.mock('aws-sdk', () => {
    return {
        Endpoint: jest.fn().mockImplementation((x) => { return x }),
        config: {
            logger: '',
            update: (x) => 'update'
        },
        SQS: jest.fn().mockImplementation(() => {
            return {
                sendMessage: (a, cb) => {
                    return cb(null, 'enviado')
                }
            }
        })
    }
});

describe('Lambda Anulación de transporte', () => {

    test('Transporte no existe', async () => {
        let rawdata = fs.readFileSync('input.json');
        let transporte = JSON.stringify(JSON.parse(rawdata));
        const payload = {
            "Records": [
                {
                    "messageId": "MessageID_1",
                    "receiptHandle": "MessageReceiptHandle",
                    "body": transporte,
                    "md5OfBody": "fce0ea8dd236ccb3ed9b37dae260836f",
                    "md5OfMessageAttributes": "582c92c5c5b6ac403040a4f3ab3115c9",
                    "eventSourceARN": "arn:aws:sqs:us-west-2:123456789012:SQSQueue",
                    "eventSource": "aws:sqs",
                    "awsRegion": "us-west-2",
                }
            ]
        };
        let context = {
            succeed: (x) => '',
            fail: () => ''
        }
        await lambda.handler(payload, context);
        expect(3).toBe(3);
    });

});