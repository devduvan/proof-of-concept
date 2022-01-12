"use strict";

const { DynamoDB } = require("aws-sdk");
const moment = require("moment-timezone");

const Env = require(`${process.env.GENERAL_LAYER_DIR}/lib/Env`);

const ImageModel = require("../models/ImageModel");

const db = new DynamoDB.DocumentClient({
  ...Env.getConfigForAwsService("DynamoDB"),
});

const IMAGES_TABLE_NAME = process.env.IMAGES_TABLE_NAME;

class ImageMapper {
  static getObjectToDb(image) {
    return {
      idUser: image.idUser,
      id: image.id,
      name: image.name,
      status: image.status,
      path: image.path,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
    };
  }

  static async save(image) {
    const isNewRecord = typeof image.createdAt === "undefined";

    const now = moment().format("YYYY-MM-DD HH:mm:ss");

    let conditionExpression = null;

    if (isNewRecord) {
      image.createdAt = now;
      conditionExpression = `attribute_not_exists(idUser)`;
    } else {
      image.updatedAt = now;
    }

    await db
      .put({
        TableName: IMAGES_TABLE_NAME,
        ConditionExpression: conditionExpression,
        Item: ImageMapper.getObjectToDb(image),
      })
      .promise();
  }

  static async getById(idUser, id) {
    let image = null;

    try {
      const data = await db
        .get({
          TableName: IMAGES_TABLE_NAME,
          Key: {
            idUser: idUser,
            id: id,
          },
        })
        .promise();

      if (data && data.Item) {
        image = new ImageModel(data.Item);
      }
    } catch (e) {
      console.error(e);
    }

    return image;
  }
}

module.exports = ImageMapper;
