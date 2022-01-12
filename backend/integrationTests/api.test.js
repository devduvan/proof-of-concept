const supertest = require("supertest");

const api = supertest(process.env.API_URL);

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

test("Image is greater than 5MB", async () => {
  const { body } = await api
    .post("/images")
    .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
    .attach("image", `${__dirname}/images/400-by-size.jpg`)
    .expect(400);

  expect(body.errors).toStrictEqual({
    IMAGES_1: {
      code: "IMAGES_1",
      message: "Image is greater than 5MB",
    },
  });
});

test("Image PNG not supported", async () => {
  const { body } = await api
    .post("/images")
    .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
    .attach("image", `${__dirname}/images/400-by-type.png`)
    .expect(400);

  expect(body.errors).toStrictEqual({
    IMAGES_2: {
      code: "IMAGES_2",
      message: "Image is not a valid JPEG image",
    },
  });
});

test("Image param is empty", async () => {
  const { body } = await api
    .post("/images")
    .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
    .attach("image", `${__dirname}/images/empty.jpeg`)
    .expect(400);

  expect(body.errors).toStrictEqual({
    IMAGES_3: {
      code: "IMAGES_3",
      message: "Image param is empty",
    },
  });
});

test("Image param not exists in the request", async () => {
  const { body } = await api
    .post("/images")
    .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
    .attach("noImage", `${__dirname}/images/200.jpeg`)
    .expect(400);

  expect(body.errors).toStrictEqual({
    IMAGES_4: {
      code: "IMAGES_4",
      message: "Image param is required",
    },
  });
});

test("Image uploaded with success", async () => {
  const { body } = await api
    .post("/images")
    .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
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

test("Get thumbnails", async () => {
  const { imageCreatedBody } = await api
    .post("/images")
    .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
    .attach("image", `${__dirname}/images/200.jpeg`)
    .expect(201);

  await sleep(500);

  const { body } = await api
    .get("/thumbnails")
    .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
    .query({ image_id: imageCreatedBody.image.id })
    .expect(200);

  expect(body.thumbnails.length).toBe(3);

  for (let index = 0; index < body.thumbnails.length; index++) {
    const thumbnail = body.thumbnails[index];
    expect(["400x300", "160x120", "120x120"]).toContain(thumbnail.size);
  }
});
