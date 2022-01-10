"use strict";

class Env {
  /**
   * Returns the config for aws service
   *
   * @param {string} service Service name
   *
   * @returns {string}
   */
  static getConfigForAwsService(service) {
    let config = {};

    if (process.env.ENV === "dev") {
      config.endpoint = process.env.INFRA_LOCALHOST_URL;

      switch (service) {
        case "S3":
          config.s3ForcePathStyle = true;
          break;
      }
    }

    return config;
  }
}

module.exports = Env;
