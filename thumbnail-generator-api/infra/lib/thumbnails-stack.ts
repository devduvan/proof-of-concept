import { CfnOutput, Duration, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

import { aws_iam as iam, aws_sqs as sqs, aws_sns as sns } from "aws-cdk-lib";

import * as Util from "../util";
import { CustomStackProps } from "../interfaces";

export class ThumbnailsStack extends Stack {
  constructor(scope: Construct, id: string, props: CustomStackProps) {
    super(scope, id, Util.getCdkPropsFromCustomProps(props));

    const thumbnailsForGenerateQueue = new sqs.Queue(
      this,
      "ThumbnailsForGenerateQueue",
      {
        queueName: Util.getResourceNameWithPrefix(
          `thumbnails-for-generate-${props.env}`
        ),
      }
    );

    const sqsPolicyStatement = new iam.PolicyStatement();

    sqsPolicyStatement.addResources(thumbnailsForGenerateQueue.queueArn);
    sqsPolicyStatement.addActions(
      Util.getSendActionsSqsPolicyStatement().join(",")
    );

    const thumbnailGeneratedTopic = new sns.Topic(
      this,
      "ThumbnailGeneratedTopic",
      {
        topicName: Util.getResourceNameWithPrefix(
          `thumbnail-generated-${props.env}`
        ),
        displayName: Util.getResourceNameWithPrefix(
          `thumbnail-generated-${props.env}`
        ),
      }
    );

    const snsPolicyStatement = new iam.PolicyStatement();

    snsPolicyStatement.addResources(thumbnailGeneratedTopic.topicArn);
    snsPolicyStatement.addActions(
      Util.getPublishActionsSnsPolicyStatement().join(",")
    );

    const thumbnailsLambdaRole = new iam.Role(this, "ThumbnailsLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      roleName: Util.getResourceNameWithPrefix(
        `thumbnails-lambda-role-${props.env}`
      ),
      description: "Role for lambdas of thumbnials service",
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole"
        ),
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
      inlinePolicies: {
        [Util.getResourceNameWithPrefix(`lambda-role-policy-${props.env}`)]:
          new iam.PolicyDocument({
            statements: [snsPolicyStatement, sqsPolicyStatement],
          }),
      },
    });

    new CfnOutput(this, "ThumbnailsForGenerateQueueArn", {
      exportName: Util.getResourceNameWithPrefix(
        `thumbnails-for-generate-queue-arn-${props.env}`
      ),
      value: thumbnailsForGenerateQueue.queueArn,
    });

    new CfnOutput(this, "ThumbnailGeneratedTopicArn", {
      exportName: Util.getResourceNameWithPrefix(
        `thumbnail-generated-topic-arn-${props.env}`
      ),
      value: thumbnailGeneratedTopic.topicArn,
    });

    new CfnOutput(this, "ThumbnailsLambdaRoleArn", {
      exportName: Util.getResourceNameWithPrefix(
        `thumbnails-lambda-role-arn-${props.env}`
      ),
      value: thumbnailsLambdaRole.roleArn,
    });
  }
}
