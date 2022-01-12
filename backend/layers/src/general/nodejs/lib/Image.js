"use strict";

const sharp = require("sharp");

class Image {
  /**
   * Upload file to the cloud
   *
   * @param {string} options.path File path on cloud
   * @param {string} options.content File content
   * @param {string} options.contentType
   */
  static async resize(image, { width, height }) {
    return sharp(image).resize(width, height).jpeg().toBuffer();
  }
}

module.exports = Image;
