#!/usr/bin/env node
import { App } from "aws-cdk-lib";

import * as dotenv from "dotenv";

import { SharedStack } from "../lib/shared-stack";
import { ImagesStack } from "../lib/images-stack";
import { ThumbnailsStack } from "../lib/thumbnails-stack";

import * as Util from "../util";

const app = new App();

const env = app.node.tryGetContext("env");

dotenv.config({ path: `./.env.${env}` });

if (["test", "dev"].indexOf(env) === -1) {
  throw new Error(`Env -${env}- not supported`);
}

const account: string | undefined = process.env.AWS_ACCOUNT_ID;
const region: string | undefined = process.env.AWS_REGION;

if (env !== "dev" && !account) {
  throw new Error("AWS_ACCOUNT_ID is not defined in your env");
}

if (env !== "dev" && !region) {
  throw new Error("AWS_REGION is not defined in your env");
}

const sharedProps = {
  env: env,
  account: account,
  region: region,
};

const sharedStack = new SharedStack(app, `shared-${env}`, {
  ...sharedProps,
  name: Util.getStackNameWithPrefix(`shared-${env}`),
});

const imagesStack = new ImagesStack(app, `images-${env}`, {
  ...sharedProps,
  name: Util.getStackNameWithPrefix(`images-${env}`),
});

imagesStack.addDependency(sharedStack);

const thumbnailsStack = new ThumbnailsStack(app, `thumbnails-${env}`, {
  ...sharedProps,
  name: Util.getStackNameWithPrefix(`thumbnails-${env}`),
});

thumbnailsStack.addDependency(imagesStack);
thumbnailsStack.addDependency(sharedStack);
