'use strict';
var querystring = require('querystring');
var https = require('https');

class CaptchaCheck {

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

    return new Promise(resolve => {
      const req = https.request(options, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunkData) => {
          const respData = JSON.parse(chunkData);
          console.log("Got response: ", chunkData);
          resolve(respData.success);     
        });
      });
    
      req.on('error', (e) => {
        console.error("Got error: ", e.message);
        resolve(false);
      });
    
      req.write(post_data);
      req.end();
    });    
  }
}

module.exports = CaptchaCheck;
