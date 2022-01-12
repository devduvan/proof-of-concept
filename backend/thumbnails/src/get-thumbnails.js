"use strict";

const ThumbnailMapper = require(`${process.env.LAYER_DIR}/mappers/ThumbnailMapper`);

const ApiGatewayRequest = require(`${process.env.GENERAL_LAYER_DIR}/requests/ApiGatewayRequest`);

const ApiGatewayResponse = require(`${process.env.GENERAL_LAYER_DIR}/responses/ApiGatewayResponse`);

exports.handler = async (event) => {
  let response = {};

  try {
    const request = new ApiGatewayRequest(event);

    let thumbnails = [];

    const queryResult = await ThumbnailMapper.getByIdUser(request.getIdUser(), {
      idImage: request.getQueryParam("image_id", null),
      size: request.getQueryParam("size", null),
    });

    if (queryResult && queryResult.thumbnails) {
      thumbnails = queryResult.thumbnails.map((thumbnail) => {
        return thumbnail.toPublicJson();
      });
    }

    response = ApiGatewayResponse.response(200, {
      thumbnails: thumbnails,
    });
  } catch (e) {
    response = ApiGatewayResponse.responseException(e);
  }

  return response;
};
