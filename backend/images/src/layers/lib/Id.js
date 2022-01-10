"use strict";

const ULID = require("ulid");

class Id {
  /**
   * Generate an id
   *
   * @returns {string}
   */
  static generate() {
    return ULID.ulid();
  }
}

module.exports = Id;
