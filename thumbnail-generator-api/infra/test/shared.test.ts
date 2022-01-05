import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";

import * as SharedStack from "../lib/shared-stack";

import * as Util from "../util";

test("Check that bucket exists", () => {
  const app = new cdk.App();

  const stack = new SharedStack.SharedStack(app, "SharedStackTest", {
    env: "test",
    name: "shared-stack",
  });

  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::S3::Bucket", {
    BucketName: Util.getResourceNameWithPrefix(`images-test`),
  });
});

test("Check that the necessary outputs exists", () => {
  const app = new cdk.App();

  const stack = new SharedStack.SharedStack(app, "SharedStackTest", {
    env: "test",
    name: "shared-stack",
  });

  const template = Template.fromStack(stack);

  template.hasOutput("ImagesBucketArn", {
    Export: {
      Name: Util.getResourceNameWithPrefix(`images-bucket-arn-test`),
    },
  });
});
