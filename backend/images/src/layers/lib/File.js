"use strict";

const { S3 } = require("aws-sdk");

const Env = require("./Env");

const s3 = new S3({
  ...Env.getConfigForAwsService("S3"),
  params: { Bucket: process.env.API_BUCKET_NAME },
});

class File {
  /**
   * Upload file to the cloud
   *
   * @param {string} options.path File path on cloud
   * @param {string} options.content File content
   * @param {string} options.contentType
   */
  static async uploadToCloud({ path, content, contentType }) {
    await s3
      .putObject({
        Key: path,
        Body: content,
        ContentType: contentType,
      })
      .promise();
  }
}

module.exports = File;
