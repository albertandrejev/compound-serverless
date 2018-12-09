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

  const captchaCheck = new CaptchaCheck(onCaptchaSuccess(event, callback), onError(callback));
  captchaCheck.check(parsedBody['g-recaptcha-response'], sourceIp);
};

const onSuccess = (callback) => (content) => {
  console.log(content);

  var response = {
    statusCode: 301,
    headers: {
      "Location": process.env.SUCCESS_REDIRECT
    },
    body: null
  };
  callback(null, response);
}

const onError = (callback) => (statusCode, err) => {
  console.log('error: ', JSON.stringify({ error: err }));
  callback(null, {
    statusCode: statusCode,
    body: JSON.stringify({ error: err }),
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}

const onCaptchaSuccess = (event, callback) => (data) => {
  const sourceIp = event.requestContext.identity.sourceIp;
  const userAgent = event.requestContext.identity.userAgent;
  const parsedBody = querystring.parse(event.body);

  const bucketName = process.env.S3_BUCKET;
  const storagePath = process.env.STORAGE_PATH;

  const dataStorage = new DataStorage(bucketName, storagePath, onSuccess(callback), onError(callback));
  const submittedData = {
    firstName: parsedBody['first-name'],
    lastName: parsedBody['last-name'],
    email: parsedBody['email'],
    ip: sourceIp,
    userAgent: userAgent 
  }
  dataStorage.add(submittedData, parsedBody['email']);

  console.log(JSON.stringify(data));
}

