import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";

import * as ThumbnailsStack from "../lib/thumbnails-stack";

import * as Util from "../util";

test("Check that table, queue and role exists", () => {
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

  template.hasResourceProperties("AWS::DynamoDB::Table", {
    TableName: Util.getResourceNameWithPrefix(`thumbnails-test`),
  });

  template.hasResourceProperties("AWS::SQS::Queue", {
    QueueName: Util.getResourceNameWithPrefix(`thumbnails-for-generate-test`),
  });

  template.hasResourceProperties("AWS::SNS::Subscription", {
    Protocol: "sqs",
  });

  template.hasResourceProperties("AWS::SNS::Topic", {
    TopicName: Util.getResourceNameWithPrefix(`thumbnails-generated-test`),
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

  template.hasOutput("ThumbnailsTableArn", {
    Export: {
      Name: Util.getResourceNameWithPrefix(`thumbnails-table-arn-test`),
    },
  });

  template.hasOutput("ThumbnailsForGenerateQueueArn", {
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
