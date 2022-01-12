const handler = require("../src/generate-thumbnails");
const sqs = require("./mocks/sqs");
const images = require("./mocks/images");

test("Get thumbnails", async () => {
  const { body } = await api.get(`/thumbnails`).expect(200);

  for (let index = 0; index < body.thumbnails.length; index++) {
    const thumbnail = body.thumbnails[index];
    expect(["400x300", "160x120", "120x120"]).toContain(thumbnail.size);
  }
});

test("Get thumbnails by imageId", async () => {
  const image = await images.createImage();

  await handler.handler(sqs.getEventFromImage(image));

  const { body } = await api
    .get(`/thumbnails`)
    .query({ imageId: image.id })
    .expect(200);

  expect(body.thumbnails.length).toBe(3);

  for (let index = 0; index < body.thumbnails.length; index++) {
    const thumbnail = body.thumbnails[index];
    expect(["400x300", "160x120", "120x120"]).toContain(thumbnail.size);
  }
});

test("Get thumbnails by imageId and size", async () => {
  const image = await images.createImage();

  await handler.handler(sqs.getEventFromImage(image));

  const { body } = await api
    .get(`/thumbnails`)
    .query({ imageId: image.id, size: "120x120" })
    .expect(200);

  expect(body.thumbnails.length).toBe(1);

  for (let index = 0; index < body.thumbnails.length; index++) {
    const thumbnail = body.thumbnails[index];
    expect(["120x120"]).toContain(thumbnail.size);
  }
});
