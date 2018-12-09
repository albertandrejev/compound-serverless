'use strict';
var querystring = require('querystring');
var CaptchaCheck = require('./CaptchaCheck');

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
  var response = {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(data),
  };
  callback(null, response);  

  console.log(JSON.stringify(data));
}


