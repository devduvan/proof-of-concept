import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";

import * as ImagesStack from "../lib/images-stack";

import * as Util from "../util";

test("Check that table, topic and role exists", () => {
  const app = new cdk.App();

  const stack = new ImagesStack.ImagesStack(app, "ImagesStackTest", {
    env: "test",
    name: "images-stack",
  });

  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::DynamoDB::Table", {
    TableName: Util.getResourceNameWithPrefix(`images-test`),
  });

  template.hasResourceProperties("AWS::SNS::Topic", {
    TopicName: Util.getResourceNameWithPrefix(`image-created-test`),
  });

  template.hasResourceProperties("AWS::IAM::Role", {
    RoleName: Util.getResourceNameWithPrefix(`images-lambda-role-test`),
  });
});

test("Check that the necessary outputs exists", () => {
  const app = new cdk.App();

  const stack = new ImagesStack.ImagesStack(app, "ImagesStackTest", {
    env: "test",
    name: "images-stack",
  });

  const template = Template.fromStack(stack);

  template.hasOutput("ImagesTableArn", {
    Export: {
      Name: Util.getResourceNameWithPrefix(`images-table-arn-test`),
    },
  });

  template.hasOutput("ImagesTableName", {
    Export: {
      Name: Util.getResourceNameWithPrefix(`images-table-name-test`),
    },
  });

  template.hasOutput("ImageCreatedTopicArn", {
    Export: {
      Name: Util.getResourceNameWithPrefix(`image-created-topic-arn-test`),
    },
  });

  template.hasOutput("ImagesLambdaRoleArn", {
    Export: {
      Name: Util.getResourceNameWithPrefix(`images-lambda-role-arn-test`),
    },
  });
});
