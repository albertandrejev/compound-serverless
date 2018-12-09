'use strict';
var querystring = require('querystring');

exports.handler = (event, context, callback) => {

  const sourceIp = event.requestContext.identity.sourceIp;
  const userAgent = event.requestContext.identity.userAgent;
  const parsedBody = querystring.parse(event.body);

  console.log('IP: ', sourceIp);
  console.log('User Agent: ', userAgent);
  console.log('Request body decoded: ', JSON.stringify(parsedBody));

  var response = {
    statusCode: 201,
    body: JSON.stringify(true)
  };
  callback(null, response);
};


