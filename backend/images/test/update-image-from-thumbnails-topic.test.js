const handler = require("../src/update-image-from-thumbnails-topic");
const event = require("./mocks/thumbnails-generated-event.json");

test("Thumbnails generated with success", async () => {
  const response = await handler.handler(event);

  expect(response.image).toBeDefined();
  expect(response.image.status).toBe("THUMBNAILS_GENERATED");
});
