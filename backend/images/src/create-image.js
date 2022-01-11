"use strict";

const Id = require(`${process.env.LAYERS_DIR}/lib/Id`);
const FormData = require(`${process.env.LAYERS_DIR}/lib/FormData`);

const ImageModel = require(`${process.env.LAYERS_DIR}/models/ImageModel`);

const ImageMapper = require(`${process.env.LAYERS_DIR}/mappers/ImageMapper`);

const ValidationException = require(`${process.env.LAYERS_DIR}/exceptions/ValidationException`);

const ApiGatewayResponse = require(`${process.env.LAYERS_DIR}/responses/ApiGatewayResponse`);

const SUPPORTED_IMAGE_TYPES = ["image/jpeg"];

const validateEvent = (event) => {
  const contetType = event.headers["Content-Type"]
    ? event.headers["Content-Type"]
    : event.headers["content-type"];

  const contentLength = event.headers["Content-Length"]
    ? event.headers["Content-Length"]
    : event.headers["content-length"];

  if (!contetType) {
    throw new ValidationException("INVALID_REQUEST");
  }

  if (!contetType.includes("multipart/form-data")) {
    throw new ValidationException("INVALID_REQUEST");
  }

  if (contentLength >= 5000000) {
    throw new ValidationException("IMAGE_SIZE_NOT_SUPPORTED");
  }
};

const createImageModel = async (event) => {
  const files = await FormData.getFiles(event);

  const file = files.filter((file) => {
    return file.field === "image";
  })[0];

  if (!file) {
    if (files.length <= 0) {
      throw new ValidationException("IMAGE_IS_EMPTY");
    } else {
      throw new ValidationException("IMAGE_PARAM_IS_REQUIRED");
    }
  }

  if (SUPPORTED_IMAGE_TYPES.indexOf(file.type) === -1) {
    throw new ValidationException("IMAGE_TYPE_NOT_SUPPORTED");
  }

  const id = Id.generate();

  let idUser = null;

  if (event.requestContext.authorizer.jwt.claims) {
    idUser = event.requestContext.authorizer.jwt.claims.sub;
  } else if (process.env.ENV === "dev") {
    idUser = "dev-user";
  }

  if (!idUser) {
    throw new ValidationException("UNAUTHORIZED_USER");
  }

  return new ImageModel({
    idUser: idUser,
    id: id,
    name: file.fileName,
    content: file.content,
    status: "THUMBNAILS_PENDING",
    path: `users/${idUser}/images/${id}/${file.fileName}`,
  });
};

exports.handler = async (event) => {
  let response = {};

  try {
    validateEvent(event);

    const image = await createImageModel(event);

    await ImageMapper.save(image);
    await image.uploadToCloud();
    await image.publishEvent("image-created");

    response = ApiGatewayResponse.response(201, {
      image: image.toPublicJson(),
    });
  } catch (e) {
    response = ApiGatewayResponse.responseException(e);
  }

  return response;
};
