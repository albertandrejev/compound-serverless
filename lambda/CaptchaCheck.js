'use strict';
var querystring = require('querystring');
var https = require('https');

class CaptchaCheck {
  constructor(successCallback, errorCallback) {
    this._successCallback = successCallback;
    this._errorCallback = errorCallback;
  } 

  _requestData(response, ip) {
    return querystring.stringify({
      secret: process.env.CAPTCHA_SECRET,
      response: response,
      remoteip: ip
    });
  }

  _requestOptions(post_data) {
    return {
      hostname: 'www.google.com',
      path: '/recaptcha/api/siteverify',
      port: '443',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(post_data)
      }
    };  
  }

  check(response, ip) {
    var post_data = this._requestData(response, ip);  
    const options = this._requestOptions(post_data);
  
    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunkData) => {
        const respData = JSON.parse(chunkData);
        if (respData.success) {
          this._successCallback(respData);
        } else {
          this._errorCallback(403, respData);
        }
        console.log("Got response: ", chunkData);
      });
    });
  
    req.on('error', (e) => {
      this._errorCallback(403, e.message );
      console.error("Got error: ", e.message);
    });
  
    req.write(post_data);
    req.end();
  }
}

module.exports = CaptchaCheck;
