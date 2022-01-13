"use strict";

const parser = require("lambda-multipart-parser");

class FormData {
  /**
   * Get file from event multipart/form-data
   *
   * @param {object} event Lambda event
   */
  static async getFiles(event) {
    let files = [];

    try {
      const result = await parser.parse(event);
      files = result.files.map((file) => {
        return {
          field: file.fieldname,
          fileName: file.filename,
          content: file.content,
          type: file.contentType,
        };
      });
    } catch (e) {
      console.error(e);
    }

    return files;
  }
}

module.exports = FormData;
