"use strict";

class ValidationException extends Error {
  /**
   * Constructor
   *
   * @param {string} identifier Identifier of code
   */
  constructor(identifier) {
    let code = null;
    let message = "Error validating";
    let httpStatusCode = 400;

    switch (identifier) {
      case "INVALID_REQUEST":
        code = 400;
        message = "Invalid request, please verify the content-type and body";
        break;

      case "UNAUTHORIZED_USER":
        httpStatusCode = 401;
        code = 401;
        message = "Unautorized user";
        break;

      case "IMAGE_NOT_FOUND":
        httpStatusCode = 404;
        code = 404;
        message = "Image not found";
        break;

      case "IMAGE_SIZE_NOT_SUPPORTED":
        code = "IMAGES_1";
        message = "Image is greater than 4.5MB";
        break;

      case "IMAGE_TYPE_NOT_SUPPORTED":
        code = "IMAGES_2";
        message = "Image is not a valid JPEG image";
        break;

      case "IMAGE_IS_EMPTY":
        code = "IMAGES_3";
        message = "Image param is empty";
        break;

      case "IMAGE_PARAM_IS_REQUIRED":
        code = "IMAGES_4";
        message = "Image param is required";
        break;
    }

    super(message);

    this.code = code;
    this.httpStatusCode = httpStatusCode;
  }
}

module.exports = ValidationException;
