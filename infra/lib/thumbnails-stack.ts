import { CfnOutput, Duration, Fn, RemovalPolicy, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

import {
  aws_iam as iam,
  aws_dynamodb as dynamodb,
  aws_sqs as sqs,
  aws_sns as sns,
  aws_sns_subscriptions as subscriptions,
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
    thumbnailsTable.applyRemovalPolicy(RemovalPolicy.DESTROY);

    const dynamoPolicyStatement = new iam.PolicyStatement();

    dynamoPolicyStatement.addResources(thumbnailsTable.tableArn);
    dynamoPolicyStatement.addActions(
      ...Util.getReadActionsDynamoPolicyStatement()
    );
    dynamoPolicyStatement.addActions(
      ...Util.getWriteActionsDynamoPolicyStatement()
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

    const imageCreatedTopic = sns.Topic.fromTopicArn(
      this,
      "ImageCreatedTopic",
      Fn.importValue(
        Util.getResourceNameWithPrefix(`image-created-topic-arn-${props.env}`)
      )
    );

    imageCreatedTopic.addSubscription(
      new subscriptions.SqsSubscription(thumbnailsForGenerateQueue)
    );

    const sqsPolicyStatement = new iam.PolicyStatement();

    sqsPolicyStatement.addResources(thumbnailsForGenerateQueue.queueArn);
    sqsPolicyStatement.addActions(...Util.getSendActionsSqsPolicyStatement());

    const thumbnailsGeneratedTopic = new sns.Topic(
      this,
      "ThumbnailsGeneratedTopic",
      {
        topicName: Util.getResourceNameWithPrefix(
          `thumbnails-generated-${props.env}`
        ),
        displayName: Util.getResourceNameWithPrefix(
          `thumbnails-generated-${props.env}`
        ),
      }
    );

    const snsPolicyStatement = new iam.PolicyStatement();

    snsPolicyStatement.addResources(thumbnailsGeneratedTopic.topicArn);
    snsPolicyStatement.addActions(
      ...Util.getPublishActionsSnsPolicyStatement()
    );

    const bucketArn = Fn.importValue(
      Util.getResourceNameWithPrefix(`images-bucket-arn-${props.env}`)
    );

    const s3PolicyStatement = new iam.PolicyStatement();

    s3PolicyStatement.addResources(`${bucketArn}/*`);

    s3PolicyStatement.addActions(...Util.getReadActionsS3PolicyStatement());

    s3PolicyStatement.addActions(...Util.getWriteActionsS3PolicyStatement());

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

    new CfnOutput(this, "ThumbnailsTableName", {
      exportName: Util.getResourceNameWithPrefix(
        `thumbnails-table-name-${props.env}`
      ),
      value: thumbnailsTable.tableName,
    });

    new CfnOutput(this, "ThumbnailsForGenerateQueueArn", {
      exportName: Util.getResourceNameWithPrefix(
        `thumbnails-for-generate-queue-arn-${props.env}`
      ),
      value: thumbnailsForGenerateQueue.queueArn,
    });

    new CfnOutput(this, "ThumbnailsGeneratedTopicArn", {
      exportName: Util.getResourceNameWithPrefix(
        `thumbnails-generated-topic-arn-${props.env}`
      ),
      value: thumbnailsGeneratedTopic.topicArn,
    });

    new CfnOutput(this, "ThumbnailsLambdaRoleArn", {
      exportName: Util.getResourceNameWithPrefix(
        `thumbnails-lambda-role-arn-${props.env}`
      ),
      value: thumbnailsLambdaRole.roleArn,
    });
  }
}
