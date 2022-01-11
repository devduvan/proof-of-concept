"use strict";

const { SNS } = require("aws-sdk");

const File = require(`${process.env.GENERAL_LAYER_DIR}/lib/File`);
const Image = require(`${process.env.GENERAL_LAYER_DIR}/lib/Image`);
const Id = require(`${process.env.GENERAL_LAYER_DIR}/lib/Id`);
const Env = require(`${process.env.GENERAL_LAYER_DIR}/lib/Env`);

const ThumbnailModel = require(`${process.env.LAYER_DIR}/models/ThumbnailModel`);

const ThumbnailMapper = require(`${process.env.LAYER_DIR}/mappers/ThumbnailMapper`);

const THUMBNAIL_SIZES = [
  { name: "400x300", width: 400, height: 300 },
  { name: "160x120", width: 160, height: 120 },
  { name: "120x120", width: 120, height: 120 },
];

const publishEvent = async (event, message) => {
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
      Message: JSON.stringify(message),
    })
    .promise();
};

const createThumbnailsFromImage = async (image) => {
  let thumbnails = [];

  for (let index = 0; index < THUMBNAIL_SIZES.length; index++) {
    const size = THUMBNAIL_SIZES[index];

    const thumbnailsResult = await ThumbnailMapper.getByImage(image, {
      size: size.name,
    });

    //if (thumbnailsResult.count > 0) continue;

    const file = await File.getFromCloud(image.path);

    if (!file) {
      console.log("image", image);
      throw new Error("Image not exists on s3");
    }

    const imageResized = await Image.resize(file.content, size);

    const imageName = image.name.substring(0, image.name.lastIndexOf("."));
    const imageType = image.name.substring(
      image.name.lastIndexOf("."),
      image.name.length
    );

    const id = Id.generate();

    const thumbnail = new ThumbnailModel({
      idUser: image.idUser,
      idImage: image.id,
      id: id,
      size: size.name,
      content: imageResized,
      path: `users/${image.idUser}/images/${image.id}/thumbnails/${imageName}@${size.name}.${imageType}`,
    });

    await ThumbnailMapper.save(thumbnail);
    await thumbnail.uploadToCloud();

    thumbnails.push(thumbnail);
  }

  return thumbnails;
};

exports.handler = async (event) => {
  if (!event.Records) return;

  let thumbnails = [];

  for (let index = 0; index < event.Records.length; index++) {
    const record = event.Records[index];

    switch (record.eventSource) {
      case "aws:sqs":
        const image = JSON.parse(record.body).image;
        thumbnails = await createThumbnailsFromImage(image);

        thumbnails = thumbnails.map((thumbnail) => {
          return thumbnail.toJson();
        });

        await publishEvent("thumbnails-generated", {
          image: image,
          thumbnails: thumbnails,
        });
        break;
    }
  }

  return {
    thumbnails: thumbnails,
  };
};
