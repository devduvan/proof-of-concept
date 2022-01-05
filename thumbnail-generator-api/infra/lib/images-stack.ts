import { CfnOutput, Duration, Stack } from "aws-cdk-lib";
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

    const dynamoPolicyStatement = new iam.PolicyStatement();

    dynamoPolicyStatement.addResources(imagesTable.tableArn);
    dynamoPolicyStatement.addActions(
      Util.getReadActionsDynamoPolicyStatement().join(",")
    );
    dynamoPolicyStatement.addActions(
      Util.getWriteActionsDynamoPolicyStatement().join(",")
    );

    const imageUploadedTopic = new sns.Topic(this, "ImageUploaded", {
      topicName: Util.getResourceNameWithPrefix(`image-uploaded-${props.env}`),
      displayName: Util.getResourceNameWithPrefix(
        `image-uploaded-${props.env}`
      ),
    });

    const snsPolicyStatement = new iam.PolicyStatement();

    snsPolicyStatement.addResources(imageUploadedTopic.topicArn);
    snsPolicyStatement.addActions(
      Util.getPublishActionsSnsPolicyStatement().join(",")
    );

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
            statements: [dynamoPolicyStatement, snsPolicyStatement],
          }),
      },
    });

    new CfnOutput(this, "ImagesTableArn", {
      exportName: Util.getResourceNameWithPrefix(
        `images-table-arn-${props.env}`
      ),
      value: imagesTable.tableArn,
    });

    new CfnOutput(this, "ImageUploadedTopicArn", {
      exportName: Util.getResourceNameWithPrefix(
        `image-uploaded-topic-arn-${props.env}`
      ),
      value: imageUploadedTopic.topicArn,
    });

    new CfnOutput(this, "ImagesLambdaRoleArn", {
      exportName: Util.getResourceNameWithPrefix(
        `images-lambda-role-arn-${props.env}`
      ),
      value: imagesLambdaRole.roleArn,
    });
  }
}
