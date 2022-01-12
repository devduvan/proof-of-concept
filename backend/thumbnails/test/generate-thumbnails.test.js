const handler = require("../src/generate-thumbnails");

const sqs = require("./mocks/sqs");
const images = require("./mocks/images");

test("Thumbnails generated with success", async () => {
  const image = await images.createImage();

  const response = await handler.handler(sqs.getEventFromImage(image));

  expect(response.thumbnails.length).toBe(3);

  for (let index = 0; index < response.thumbnails.length; index++) {
    const thumbnail = response.thumbnails[index];
    expect(thumbnail.idImage).toBe(image.id);
    expect(["400x300", "160x120", "120x120"]).toContain(thumbnail.size);
  }
});
