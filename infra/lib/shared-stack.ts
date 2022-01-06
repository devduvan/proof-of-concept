import { CfnOutput, Duration, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

import { aws_s3 as s3, aws_apigatewayv2 as apiGw } from "aws-cdk-lib";

import * as Util from "../util";
import { CustomStackProps } from "../interfaces";

export class SharedStack extends Stack {
  constructor(scope: Construct, id: string, props: CustomStackProps) {
    super(scope, id, Util.getCdkPropsFromCustomProps(props));

    const imagesBucket = new s3.Bucket(this, "ImagesBucket", {
      bucketName: Util.getResourceNameWithPrefix(`images-${props.env}`),
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    const httpApi = new apiGw.CfnApi(this, "ThumbnailsApi", {
      name: Util.getResourceNameWithPrefix(`${props.env}`),
      protocolType: "HTTP",
      corsConfiguration: {
        allowCredentials: false,
        allowHeaders: ["*"],
        allowMethods: ["*"],
        allowOrigins: ["*"],
      },
    });

    const defaultStage = new apiGw.CfnStage(this, "DefaultStage", {
      apiId: httpApi.logicalId,
      stageName: "$default",
      autoDeploy: true,
      defaultRouteSettings: {
        dataTraceEnabled: false,
        detailedMetricsEnabled: false,
      },
    });

    if (!process.env.JWT_AUDIENCE)
      throw new Error("JWT_AUDIENCE is not defined in your env");

    if (!process.env.JWT_ISSUER)
      throw new Error("JWT_ISSUER is not defined in your env");

    const jwtAuthorizer = new apiGw.CfnAuthorizer(this, "JwtAuthorizer", {
      apiId: httpApi.logicalId,
      authorizerType: "JWT",
      name: Util.getResourceNameWithPrefix(`jwt-authorizer-${props.env}`),
      authorizerResultTtlInSeconds: 3600,
      identitySource: ["$request.header.Authorization"],
      jwtConfiguration: {
        audience: [process.env.JWT_AUDIENCE],
        issuer: process.env.JWT_ISSUER,
      },
    });

    new CfnOutput(this, "ImagesBucketArn", {
      exportName: Util.getResourceNameWithPrefix(
        `images-bucket-arn-${props.env}`
      ),
      value: imagesBucket.bucketArn,
    });

    new CfnOutput(this, "ThumbnailsApiId", {
      exportName: Util.getResourceNameWithPrefix(`id-${props.env}`),
      value: httpApi.logicalId,
    });

    new CfnOutput(this, "ThumbnailsApiUrl", {
      exportName: Util.getResourceNameWithPrefix(`url-${props.env}`),
      value: httpApi.getAtt("Url").toString(),
    });

    new CfnOutput(this, "JwtAuthorizerId", {
      exportName: Util.getResourceNameWithPrefix(
        `jwt-authorizer-id-${props.env}`
      ),
      value: jwtAuthorizer.logicalId,
    });
  }
}
