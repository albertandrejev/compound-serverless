'use strict';
var AWS = require('aws-sdk');
var s3 = new AWS.S3();

class DataStorage {

  constructor(bucketName, storagePath) {
    this._bucketName = bucketName;
    this._storagePath = storagePath;
  }

  _getObjectKey(filename) {
    return this._storagePath + filename + '.json';
  }

  async _checkObjectExists(filename) {
    var params = { Bucket: this._bucketName, Key: this._getObjectKey(filename) };
    try {
      await s3.headObject(params).promise();
      return true;
    } catch (headErr) {
      return false;
    }
  }

  async _createObject(data, filename) {
    var params = {
      Body: JSON.stringify(data),
      Bucket: this._bucketName,
      Key: this._getObjectKey(filename)
    };

    try {
      await s3.putObject(params).promise();
      return true;
    } catch (headErr) {
      return false;
    }
  }

  async add(data, filename) {
    const objExists = await this._checkObjectExists(filename);
    if (objExists) {
      console.log('File exists');
      return false;
    }

    console.log('File not exists');
    return await this._createObject(data, filename);
  }
}

module.exports = DataStorage;