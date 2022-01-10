import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";

import * as SharedStack from "../lib/shared-stack";

import * as Util from "../util";

test("Check that bucket, api, stage and authorizer exists", () => {
  const app = new cdk.App();

  const stack = new SharedStack.SharedStack(app, "SharedStackTest", {
    env: "test",
    name: "shared-stack",
  });

  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::S3::Bucket", {
    BucketName: Util.getResourceNameWithPrefix(`images-test`),
  });

  template.hasResourceProperties("AWS::ApiGatewayV2::Api", {
    Name: Util.getResourceNameWithPrefix(`test`),
  });

  template.hasResourceProperties("AWS::ApiGatewayV2::Stage", {
    StageName: "$default",
  });

  template.hasResourceProperties("AWS::ApiGatewayV2::Authorizer", {
    Name: Util.getResourceNameWithPrefix(`jwt-authorizer-test`),
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

  template.hasOutput("ImagesBucketName", {
    Export: {
      Name: Util.getResourceNameWithPrefix(`images-bucket-name-test`),
    },
  });

  template.hasOutput("ThumbnailsApiId", {
    Export: {
      Name: Util.getResourceNameWithPrefix(`id-test`),
    },
  });

  template.hasOutput("JwtAuthorizerId", {
    Export: {
      Name: Util.getResourceNameWithPrefix(`jwt-authorizer-id-test`),
    },
  });
});
