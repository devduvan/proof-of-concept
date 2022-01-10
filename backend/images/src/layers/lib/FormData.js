"use strict";

const parser = require("lambda-multipart-parser");

class FormData {
  /**
   * Get file from event multipart/form-data
   *
   * @param {object} event Lambda event
   */
  static async getFiles(event) {
    const result = await parser.parse(event);
    return result.files.map((file) => {
      return {
        field: file.fieldname,
        fileName: file.filename,
        content: file.content,
        type: file.contentType,
      };
    });
  }
}

module.exports = FormData;
