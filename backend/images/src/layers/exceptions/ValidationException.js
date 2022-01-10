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
        code = "GT1000";
        message = "Invalid request, please verify the content-type";
        break;
      case "FILE_SIZE_NOT_SUPPORTED":
        code = "GT1001";
        message = "File is more than 5MB";
        break;
      case "FILE_TYPE_NOT_SUPPORTED":
        code = "GT1002";
        message = "File is not a valid JPEG image";
        break;
      case "FILE_IS_EMPTY":
        code = "GT1003";
        message = "File is empty";
        break;
      case "IMAGE_PARAM_IS_REQUIRED":
        code = "GT1004";
        message = "Image param is required";
        break;
      case "UNAUTHORIZED_USER":
        httpStatusCode = 401;
        code = "GT1005";
        message = "Unautorized user";
        break;
    }

    super(message);

    this.code = code;
    this.httpStatusCode = httpStatusCode;
  }
}

module.exports = ValidationException;
