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

  static async getFromCloud(path) {
    const fileOnS3 = await s3
      .getObject({
        Key: path,
      })
      .promise();

    return {
      contentType: fileOnS3.ContentType,
      content: fileOnS3.Body,
      path: path,
    };
  }

  static getSignedUrl(path, { expires }) {
    let params = {
      Key: path,
    };

    if (expires != null) {
      params.Expires = expires;
    }

    return s3.getSignedUrl("getObject", params);
  }
}

module.exports = File;
