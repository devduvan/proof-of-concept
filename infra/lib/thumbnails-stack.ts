import { CfnOutput, Duration, Fn, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

import {
  aws_iam as iam,
  aws_dynamodb as dynamodb,
  aws_sqs as sqs,
  aws_sns as sns,
} from "aws-cdk-lib";

import * as Util from "../util";
import { CustomStackProps } from "../interfaces";

export class ThumbnailsStack extends Stack {
  constructor(scope: Construct, id: string, props: CustomStackProps) {
    super(scope, id, Util.getCdkPropsFromCustomProps(props));

    const thumbnailsTable = new dynamodb.Table(this, "ThumbnailsTable", {
      tableName: Util.getResourceNameWithPrefix(`thumbnails-${props.env}`),
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "idUser",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "sk",
        type: dynamodb.AttributeType.STRING,
      },
    });

    const dynamoPolicyStatement = new iam.PolicyStatement();

    dynamoPolicyStatement.addResources(thumbnailsTable.tableArn);
    dynamoPolicyStatement.addActions(
      Util.getReadActionsDynamoPolicyStatement().join(",")
    );
    dynamoPolicyStatement.addActions(
      Util.getWriteActionsDynamoPolicyStatement().join(",")
    );

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

    const bucketArn = Fn.importValue(
      Util.getResourceNameWithPrefix(`images-bucket-arn-${props.env}`)
    );

    const s3PolicyStatement = new iam.PolicyStatement();

    s3PolicyStatement.addResources(`${bucketArn}/*`);

    s3PolicyStatement.addActions(
      Util.getReadActionsS3PolicyStatement().join(",")
    );

    s3PolicyStatement.addActions(
      Util.getWriteActionsS3PolicyStatement().join(",")
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
            statements: [
              dynamoPolicyStatement,
              snsPolicyStatement,
              sqsPolicyStatement,
              s3PolicyStatement,
            ],
          }),
      },
    });

    new CfnOutput(this, "ThumbnailsTableArn", {
      exportName: Util.getResourceNameWithPrefix(
        `thumbnails-table-arn-${props.env}`
      ),
      value: thumbnailsTable.tableArn,
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
