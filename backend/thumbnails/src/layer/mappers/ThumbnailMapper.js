"use strict";

const { DynamoDB } = require("aws-sdk");
const moment = require("moment-timezone");

const Env = require(`${process.env.GENERAL_LAYER_DIR}/lib/Env`);

const ThumbnailModel = require("../models/ThumbnailModel");

const db = new DynamoDB.DocumentClient({
  ...Env.getConfigForAwsService("DynamoDB"),
});

const THUMBNAILS_TABLE_NAME = process.env.THUMBNAILS_TABLE_NAME;

class ThumbnailMapper {
  static getObjectToDb(thumbnail) {
    return {
      idUser: thumbnail.idUser,
      sk: thumbnail.buildSk(),
      idImage: thumbnail.idImage,
      id: thumbnail.id,
      size: thumbnail.size,
      path: thumbnail.path,
      createdAt: thumbnail.createdAt,
      updatedAt: thumbnail.updatedAt,
    };
  }

  static async save(thumbnail) {
    const isNewRecord = typeof thumbnail.createdAt === "undefined";

    const now = moment().format("YYYY-MM-DD HH:mm:ss");

    let conditionExpression = null;

    if (isNewRecord) {
      thumbnail.createdAt = now;
      conditionExpression = `attribute_not_exists(idUser)`;
    } else {
      thumbnail.updatedAt = now;
    }

    await db
      .put({
        TableName: THUMBNAILS_TABLE_NAME,
        ConditionExpression: conditionExpression,
        Item: ThumbnailMapper.getObjectToDb(thumbnail),
      })
      .promise();
  }

  static async getByIdUser(idUser, { idImage, size }) {
    let thumbnails = [];
    let count = 0;

    try {
      let params = {
        TableName: THUMBNAILS_TABLE_NAME,
        KeyConditionExpression: `#idUser = :idUser`,
        ExpressionAttributeNames: {
          "#idUser": "idUser",
        },
        ExpressionAttributeValues: {
          ":idUser": idUser,
        },
      };

      let sk = null;

      if (idImage != null) {
        sk += `image#${idImage}#`;

        if (size != null) {
          sk += `size#${size}#`;
        }
      } else if (size != null) {
        params.FilterExpression = "#size = :size";
        params.ExpressionAttributeNames["#size"] = "size";
        params.ExpressionAttributeNames[":size"] = size;
      }

      if (sk !== null) {
        params.KeyConditionExpression += `AND begins_with(#sk, :sk)`;
        params.ExpressionAttributeNames["#sk"] = "sk";
        params.ExpressionAttributeNames[":sk"] = sk;
      }

      const data = await db.query(params).promise();

      if (data && data.Items) {
        count = data.Count;

        for (let index = 0; index < data.Items.length; index++) {
          thumbnails.push(new ThumbnailModel(data.Items[index]));
        }
      }
    } catch (e) {
      console.error(e);
    }

    return { thumbnails: thumbnails, count: count };
  }
}

module.exports = ThumbnailMapper;
