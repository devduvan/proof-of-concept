"use strict";

const ImageMapper = require(`${process.env.LAYERS_DIR}/mappers/ImageMapper`);

const ValidationException = require(`${process.env.LAYERS_DIR}/exceptions/ValidationException`);

const ApiGatewayRequest = require(`${process.env.LAYERS_DIR}/requests/ApiGatewayRequest`);

const ApiGatewayResponse = require(`${process.env.LAYERS_DIR}/responses/ApiGatewayResponse`);


exports.handler = async (event) => {
  let response = {};

  try {
    const request = new ApiGatewayRequest(event);
    const image = await ImageMapper.getById(request.getIdUser(), request.getPathParam("id", null));

    if (!image) {
      throw new ValidationException("IMAGE_NOT_FOUND");
    }

    response = ApiGatewayResponse.response(200, {
      image: image.toPublicJson(),
    });
  } catch (e) {
    response = ApiGatewayResponse.responseException(e);
  }

  return response;
};
