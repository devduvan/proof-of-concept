"use strict";

class ApiGatewayResponse {
  /**
   * Create a response with format of api gateway
   *
   * @param {integer} statusCode Response status code
   * @param {object} body Response body
   * @param {object} headers Response additional headers
   *
   * @returns {object}
   */
  static response(statusCode, body, headers) {
    const defaultHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Headers": "",
      "Access-Control-Allow-Methods": "POST, PUT, GET, PATCH",
      "Access-Control-Allow-Origin": "*",
    };

    if (typeof headers === "undefined") {
      headers = defaultHeaders;
    } else {
      headers = { ...defaultHeaders, ...headers };
    }

    return {
      statusCode: statusCode,
      body: JSON.stringify(body),
      headers: headers,
    };
  }

  /**
   * Create a response from exception
   *
   * @param {object} e Exception
   *
   * @returns {object}
   */
  static responseException(e) {
    let httpStatusCode = 500;
    let code = e.code;
    let message = e.message;

    switch (e.httpStatusCode) {
      case 400:
      case 401:
      case 404:
        httpStatusCode = e.httpStatusCode;
        break;

      default:
        console.error(e);

        code = "500";
        message = "an unexpected error has occurred";
        break;
    }

    return ApiGatewayResponse.response(httpStatusCode, {
      errors: {
        [code]: {
          code: code,
          message: message
        }
      },
    });
  }
}

module.exports = ApiGatewayResponse;
