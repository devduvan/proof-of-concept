"use strict";

const ImageMapper = require(`${process.env.LAYER_DIR}/mappers/ImageMapper`);

exports.handler = async (event) => {
  const body = event.Records[0].Sns;

  if (body.Type != "Notification") return;

  if (body.Subject !== "thumbnails-generated") return;

  const snsMessage = JSON.parse(body.Message);

  const image = await ImageMapper.getById(
    snsMessage.image.idUser,
    snsMessage.image.id
  );

  if (image) {
    image.status = "THUMBNAILS_GENERATED";

    await ImageMapper.save(image);
  }

  return {
    image: image ? image.toJson() : null,
  };
};
