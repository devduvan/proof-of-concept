const supertest = require("supertest");

const api = supertest(process.env.API_URL);

test("Image is greater than 5MB", async () => {
  const { body } = await api
    .post("/images")
    .attach("image", `${__dirname}/images/400-by-size.jpg`)
    .expect(400);

  expect(body).toStrictEqual({
    errors: [
      {
        code: "GT1001",
        message: "File is more than 5MB",
      },
    ],
  });
});

test("Image PNG not supported", async () => {
  const { body } = await api
    .post("/images")
    .attach("image", `${__dirname}/images/400-by-type.png`)
    .expect(400);

  expect(body).toStrictEqual({
    errors: [
      {
        code: "GT1002",
        message: "File is not a valid JPEG image",
      },
    ],
  });
});

test("Image param not exists in the request", async () => {
  const { body } = await api
    .post("/images")
    .attach("noImage", `${__dirname}/images/200.jpeg`)
    .expect(400);

  expect(body).toStrictEqual({
    errors: [
      {
        code: "GT1004",
        message: "Image param is required",
      },
    ],
  });
});

test("Image uploaded with success", async () => {
  const { body } = await api
    .post("/images")
    .attach("image", `${__dirname}/images/200.jpeg`)
    .expect(201);

  expect(body.image).toBeDefined();
  expect(body.image.id).toBeDefined();
  expect(body.image.name).toBe("200.jpeg");
  expect(body.image.status).toBe("THUMBNAILS_PENDING");
  expect(body.image.createdAt).not.toBeNull();
  expect(isNaN(new Date(body.image.createdAt))).toBeFalsy();
  expect(body.image.updatedAt).toBeNull();
});
