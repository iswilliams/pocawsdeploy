const AWS = require('aws-sdk');
let config = require('./config');

config = config.aws_sdk
const endpoint = `http://${config.ip}:${config.port}/`

//Configuración de AWS
const configSdk = {
  endpoint: new AWS.Endpoint(endpoint),
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
  region: config.region
};

AWS.config.logger = console;
AWS.config.update(configSdk);
const sqs = new AWS.SQS;

const sendEventToSQS = async (body,queueName) => {
  return new Promise((resolve, reject) => {
    try {

      const QueueUrl = `${endpoint}${config.account}/${queueName}.fifo`
      const params = {
          MessageBody: JSON.stringify(body),
          QueueUrl: QueueUrl,
          MessageGroupId: 'default',
      };

      sqs.sendMessage(params, function(err, data) {
        if (err) reject(err) 
        else resolve(data)
      });
    } catch(err) {
      reject(err) 
    }
  })
}
 
module.exports = { sendEventToSQS }