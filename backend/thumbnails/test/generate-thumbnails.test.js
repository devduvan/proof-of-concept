const moment = require("moment");

const handler = require("../src/generate-thumbnails");

const sqs = require("./mocks/sqs");
const images = require("./mocks/images");

test("Thumbnails generated with success", async () => {
  const image = await images.createImage();

  const response = await handler.handler(sqs.getEventFromImage(image));

  expect(response.thumbnails.length).toBe(3);

  for (let index = 0; index < response.thumbnails.length; index++) {
    const thumbnail = response.thumbnails[index];
    expect(thumbnail.id).toBeDefined();
    expect(thumbnail.idImage).toBe(image.id);
    expect(["400x300", "160x120", "120x120"]).toContain(thumbnail.size);
    expect(thumbnail.url).toBeDefined();
  }
});

test("Thumbnails generated in less than 1000ms", async () => {
  const image = await images.createImage();
  const mock = sqs.getEventFromImage(image);

  const initTestDateTime = moment();
  const response = await handler.handler(mock);
  const finishTestDateTime = moment();

  expect(response.thumbnails.length).toBe(3);
  const diffInMs = finishTestDateTime.diff(initTestDateTime, "milliseconds");
  expect(diffInMs).toBeLessThan(1000);
});
