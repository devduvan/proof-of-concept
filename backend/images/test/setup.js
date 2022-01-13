const dotenv = require("dotenv");

process.env.ENV = "dev";
process.env.LAYER_DIR = "./layer/nodejs";
process.env.API_BUCKET_NAME = "thumbnail-generator-api-images-dev";
process.env.IMAGES_TABLE_NAME = "thumbnail-generator-api-images-dev";
process.env.IMAGE_CREATED_TOPIC_ARN =
  "arn:aws:sns:us-east-1:000000000000:thumbnail-generator-api-image-created-dev";

dotenv.config({ path: `${__dirname}/../../.env` });
