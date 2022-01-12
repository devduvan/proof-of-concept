const supertest = require("supertest");

const api = supertest(process.env.API_IMAGES_URL);

test("Image not found", async () => {
  const { body } = await api
    .get(`/images/TEST_ERROR`).expect(404);
});

test("Image retrieved with success", async () => {
  const createdRequestResponse = await api
    .post("/images")
    .attach("image", `${__dirname}/images/200.jpeg`).expect(201);

  const imageCreated = createdRequestResponse.body.image;

  const { body } = await api
    .get(`/images/${imageCreated.id}`).expect(200);

  expect(imageCreated).toStrictEqual(body.image);
});
