'use strict';
var querystring = require('querystring');

var CaptchaCheck = require('./CaptchaCheck');
var DataStorage = require('./DataStorage');

exports.handler = (event, context, callback) => {

  const sourceIp = event.requestContext.identity.sourceIp;
  const userAgent = event.requestContext.identity.userAgent;
  const parsedBody = querystring.parse(event.body);

  console.log('IP: ', sourceIp);
  console.log('User Agent: ', userAgent);
  console.log('Request body decoded: ', JSON.stringify(parsedBody));

  const captchaCheck = new CaptchaCheck();

  const bucketName = process.env.S3_BUCKET;
  const storagePath = process.env.STORAGE_PATH;
  const dataStorage = new DataStorage(bucketName, storagePath);

  processRequest(captchaCheck, dataStorage, sourceIp, userAgent, parsedBody, callback);
};

async function processRequest(captchaCheck, dataStorage, sourceIp, userAgent, parsedBody, callback) {
  const checkResult = await captchaCheck.check(parsedBody['g-recaptcha-response'], sourceIp);
  if (!checkResult) {
    onError(callback, 403, { captchaError: true });
    return;
  }

  const submittedData = {
    firstName: parsedBody['first-name'],
    lastName: parsedBody['last-name'],
    email: parsedBody['email'],
    ip: sourceIp,
    userAgent: userAgent
  }
  const storageResult = await dataStorage.add(submittedData, parsedBody['email']);
  if (!storageResult) {
    onError(callback, 409, { fileAlreadyExists: true });
    return;
  }

  onSuccess(callback);
}

function onError(callback, statusCode, err) {
  console.log('error: ', JSON.stringify({ error: err }));
  callback(null, {
    statusCode: statusCode,
    body: JSON.stringify({ error: err }),
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function onSuccess(callback) {
  callback(null, {
    statusCode: 301,
    body: null,
    headers: {
      "Location": process.env.SUCCESS_REDIRECT
    }    
  });
}
