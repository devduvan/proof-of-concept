"use strict";

const { SNS } = require("aws-sdk");
const moment = require("moment-timezone");

const Env = require(`${process.env.GENERAL_LAYER_DIR}/lib/Env`);
const File = require(`${process.env.GENERAL_LAYER_DIR}/lib/File`);

class ImageModel {
  /**
   * Constructor
   *
   * @param {string} props.idUser Image user id
   * @param {string} props.id Image id
   * @param {string} props.name Image name
   * @param {string} props.content Image content
   * @param {string} props.status Image status
   * @param {string} props.path Image path on cloud
   * @param {string} props.createdAt CreatedAt image
   * @param {string} props.updatedAt UpdatedAt image
   */
  constructor({
    idUser,
    id,
    name,
    content,
    status,
    path,
    createdAt,
    updatedAt,
  }) {
    this.idUser = idUser;
    this.id = id;
    this.name = name;
    this.content = content;
    this.status = status;
    this.path = path;
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

  toPublicJson() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      createdAt: this.createdAtTz,
      updatedAt: this.updatedAtTz,
    };
  }

  toJson() {
    return {
      idUser: this.idUser,
      ...this.toPublicJson(),
      path: this.path,
    };
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
   * Publish an evento on SNS
   *
   * @param {string} event Name of event
   */
  async publishEvent(event) {
    let topicArn = null;

    switch (event) {
      case "image-created":
        topicArn = process.env.IMAGE_CREATED_TOPIC_ARN;
        break;
      default:
        throw new Error(`Image event ${event} is not supported`);
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

module.exports = ImageModel;
