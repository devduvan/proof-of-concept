#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import * as dotenv from "dotenv";

import { ImagesStack } from "../lib/images-stack";

import * as Util from "../util";

dotenv.config();

const app = new App();

const env = app.node.tryGetContext("env");

if (["test"].indexOf(env) === -1) {
  throw new Error(`Env -${env}- not supported`);
}

let account: string = "";
let region: string = "";

switch (env) {
  case "test":
    account = process.env.AWS_ACCOUNT_ID_TEST || "";
    region = process.env.AWS_REGION_TEST || "";
    break;
}

if (account === "") {
  throw new Error("Account is not defined");
}

if (region === "") {
  throw new Error("Region is not defined");
}

new ImagesStack(app, `images-${env}`, {
  env: env,
  region: region,
  account: account,
  name: Util.getStackNameWithPrefix(`images-${env}`),
});
