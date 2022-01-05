import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";

import * as ThumbnailsStack from "../lib/thumbnails-stack";

import * as Util from "../util";

test("Check that queue and role exists", () => {
  const app = new cdk.App();

  const stack = new ThumbnailsStack.ThumbnailsStack(
    app,
    "ThumbnailsStackTest",
    {
      env: "test",
      name: "thumbnails-stack",
    }
  );

  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::SQS::Queue", {
    sTopicName: Util.getResourceNameWithPrefix(`thumbnails-for-generate-test`),
  });

  template.hasResourceProperties("AWS::SNS::Topic", {
    sTopicName: Util.getResourceNameWithPrefix(`thumbnail-generated-test`),
  });

  template.hasResourceProperties("AWS::IAM::Role", {
    RoleName: Util.getResourceNameWithPrefix(`thumbnails-lambda-role-test`),
  });
});

test("Check that the necessary outputs exists", () => {
  const app = new cdk.App();

  const stack = new ThumbnailsStack.ThumbnailsStack(
    app,
    "ThumbnailsStackTest",
    {
      env: "test",
      name: "thumbnails-stack",
    }
  );

  const template = Template.fromStack(stack);

  template.hasOutput("ThumnailsForGenerateQueueArn", {
    Export: {
      Name: Util.getResourceNameWithPrefix(
        `thumbnails-for-generate-queue-arn-test`
      ),
    },
  });

  template.hasOutput("ThumbnailGeneratedTopicArn", {
    Export: {
      Name: Util.getResourceNameWithPrefix(
        `thumbnail-generated-topic-arn-test`
      ),
    },
  });

  template.hasOutput("ThumbnailsLambdaRoleArn", {
    Export: {
      Name: Util.getResourceNameWithPrefix(`thumbnails-lambda-role-arn-test`),
    },
  });
});
