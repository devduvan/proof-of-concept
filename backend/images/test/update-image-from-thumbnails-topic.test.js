const supertest = require("supertest");

const handler = require("../src/update-image-from-thumbnails-topic");
const sns = require("./mocks/sns");

const api = supertest(process.env.API_IMAGES_URL);

test("Thumbnails generated with success", async () => {
  const { body } = await api
    .post("/images")
    .attach("image", `${__dirname}/images/200.jpeg`)
    .expect(201);

  const response = await handler.handler(sns.getEventFromImage(body.image));

  expect(response.image).toBeDefined();
  expect(response.image.id).toBe(body.image.id);
  expect(response.image.status).toBe("THUMBNAILS_GENERATED");
});
