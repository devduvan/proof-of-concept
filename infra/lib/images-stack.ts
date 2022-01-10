import { CfnOutput, Duration, Fn, RemovalPolicy, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

import {
  aws_iam as iam,
  aws_dynamodb as dynamodb,
  aws_sns as sns,
} from "aws-cdk-lib";

import * as Util from "../util";
import { CustomStackProps } from "../interfaces";

export class ImagesStack extends Stack {
  constructor(scope: Construct, id: string, props: CustomStackProps) {
    super(scope, id, Util.getCdkPropsFromCustomProps(props));

    const imagesTable = new dynamodb.Table(this, "ImagesTable", {
      tableName: Util.getResourceNameWithPrefix(`images-${props.env}`),
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "idUser",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
    });
    imagesTable.applyRemovalPolicy(RemovalPolicy.DESTROY);

    const dynamoPolicyStatement = new iam.PolicyStatement();

    dynamoPolicyStatement.addResources(imagesTable.tableArn);
    dynamoPolicyStatement.addActions(
      ...Util.getReadActionsDynamoPolicyStatement()
    );
    dynamoPolicyStatement.addActions(
      ...Util.getWriteActionsDynamoPolicyStatement()
    );

    const imageCreatedTopic = new sns.Topic(this, "ImageCreatedTopic", {
      topicName: Util.getResourceNameWithPrefix(`image-created-${props.env}`),
      displayName: Util.getResourceNameWithPrefix(`image-created-${props.env}`),
    });

    const snsPolicyStatement = new iam.PolicyStatement();

    snsPolicyStatement.addResources(imageCreatedTopic.topicArn);
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

    const imagesLambdaRole = new iam.Role(this, "ImagesLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      roleName: Util.getResourceNameWithPrefix(
        `images-lambda-role-${props.env}`
      ),
      description: "Role for lambdas of images service",
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
              s3PolicyStatement,
            ],
          }),
      },
    });

    new CfnOutput(this, "ImagesTableArn", {
      exportName: Util.getResourceNameWithPrefix(
        `images-table-arn-${props.env}`
      ),
      value: imagesTable.tableArn,
    });

    new CfnOutput(this, "ImagesTableName", {
      exportName: Util.getResourceNameWithPrefix(
        `images-table-name-${props.env}`
      ),
      value: imagesTable.tableName,
    });

    new CfnOutput(this, "ImageCreatedTopicArn", {
      exportName: Util.getResourceNameWithPrefix(
        `image-created-topic-arn-${props.env}`
      ),
      value: imageCreatedTopic.topicArn,
    });

    new CfnOutput(this, "ImagesLambdaRoleArn", {
      exportName: Util.getResourceNameWithPrefix(
        `images-lambda-role-arn-${props.env}`
      ),
      value: imagesLambdaRole.roleArn,
    });
  }
}
