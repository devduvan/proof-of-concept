"use strict";

const { SNS } = require("aws-sdk");
const moment = require("moment-timezone");

const Env = require(`${process.env.GENERAL_LAYER_DIR}/lib/Env`);
const File = require(`${process.env.GENERAL_LAYER_DIR}/lib/File`);

class ThumbnailModel {
  /**
   * Constructor
   *
   * @param {string} props.idUser User id
   * @param {string} props.sk Thumbnail sk
   * @param {string} props.idImage Image id
   * @param {string} props.id Thumbnail id
   * @param {string} props.size Thumbnail size
   * @param {string} props.path Thumbnail path on cloud
   * @param {Buffer} props.content Thumbnail content
   * @param {string} props.createdAt CreatedAt image
   * @param {string} props.updatedAt UpdatedAt image
   */
  constructor({
    idUser,
    sk,
    idImage,
    id,
    size,
    path,
    content,
    createdAt,
    updatedAt,
  }) {
    this.idUser = idUser;
    this.sk = sk;
    this.idImage = idImage;
    this.id = id;
    this.size = size;
    this.path = path;
    this.content = content;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  get createdAtTz() {
    return this.createdAt
      ? moment(this.createdAt)
          .tz("America/Bogota")
          .format("YYYY-MM-DD HH:mm:ss")
      : null;
  }

  get updatedAtTz() {
    return this.updatedAt
      ? moment(this.updatedAt)
          .tz("America/Bogota")
          .format("YYYY-MM-DD HH:mm:ss")
      : null;
  }

  getUrl() {
    return File.getSignedUrl(this.path, {
      expires: 60000,
    });
  }

  toPublicJson() {
    return {
      id: this.id,
      idImage: this.idImage,
      size: this.size,
      url: this.getUrl(),
      createdAt: this.createdAtTz,
      updatedAt: this.updatedAtTz,
    };
  }

  toJson() {
    return {
      idUser: this.idUser,
      idImage: this.idImage,
      ...this.toPublicJson(),
      path: this.path,
    };
  }

  buildSk() {
    return `image#${this.idImage}#size#${this.size}#id#${this.id}`;
  }

  /**
   * Upload the image to the cloud
   */
  async uploadToCloud() {
    await File.uploadToCloud({
      path: this.path,
      content: this.content,
      contentType: "image/jpeg",
    });
  }

  /**
   * Publish an event on SNS
   *
   * @param {string} event Name of event
   */
  async publishEvent(event) {
    let topicArn = null;

    switch (event) {
      case "thumbnails-generated":
        topicArn = process.env.THUMBNAILS_GENERATED_TOPIC_ARN;
        break;
      default:
        throw new Error(`Thumbnail event ${event} is not supported`);
    }

    const sns = new SNS({
      ...Env.getConfigForAwsService("SNS"),
    });

    await sns
      .publish({
        TopicArn: topicArn,
        Subject: event,
        Message: JSON.stringify({
          image: this.toJson(),
        }),
      })
      .promise();
  }
}

module.exports = ThumbnailModel;
