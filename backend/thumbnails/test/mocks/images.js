"use strict";

const supertest = require("supertest");

const api = supertest(process.env.API_IMAGES_URL);

exports.createImage = async () => {
  const { body } = await api
    .post("/images")
    .attach("image", `${__dirname}/../images/200.jpeg`)
    .expect(201);

  return body.image;
};
