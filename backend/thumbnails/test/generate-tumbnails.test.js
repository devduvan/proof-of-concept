const handler = require("../src/generate-thumbnails");
const event = require("./mocks/image-created-sqs-event.json");

test("Thumbnails generated with success", async () => {
  const response = await handler.handler(event);
  expect(response.thumbnails.length).toBe(3);

  for (let index = 0; index < response.thumbnails.length; index++) {
    const thumbnail = response.thumbnails[index];
    expect(["400x300", "160x120", "120x120"]).toContain(thumbnail.size);
  }
});
