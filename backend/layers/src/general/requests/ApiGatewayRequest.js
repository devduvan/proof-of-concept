"use strict";

class ApiGatewayResponse {
  constructor(event) {
    this.event = event;
  }

  getPathParam(name, defaultValue) {
    let param = defaultValue;

    const pathParams = this.event.pathParameters;

    if (!pathParams) {
      return param;
    }

    if (typeof pathParams[name] !== "undefined") {
      param = pathParams[name];
    }

    return param;
  }

  getQueryParam(name, defaultValue) {
    let param = defaultValue;

    const queryParams = this.event.queryStringParameters;

    if (!queryParams) {
      return param;
    }

    if (typeof queryParams[name] !== "undefined") {
      param = queryParams[name];
    }

    return param;
  }

  getIdUser() {
    let idUser = null;

    if (this.event.requestContext.authorizer.jwt.claims) {
      idUser = this.event.requestContext.authorizer.jwt.claims.sub;
    } else if (process.env.ENV === "dev") {
      idUser = "dev-user";
    }

    return idUser;
  }
}

module.exports = ApiGatewayResponse;
