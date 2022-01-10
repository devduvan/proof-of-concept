import { CfnOutput, Duration, RemovalPolicy, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

import {
  aws_s3 as s3,
  aws_apigateway as apigateway,
  aws_apigatewayv2 as apigatewayv2,
} from "aws-cdk-lib";

import * as Util from "../util";
import { CustomStackProps } from "../interfaces";

export class SharedStack extends Stack {
  constructor(scope: Construct, id: string, props: CustomStackProps) {
    super(scope, id, Util.getCdkPropsFromCustomProps(props));

    const imagesBucket = new s3.Bucket(this, "ImagesBucket", {
      bucketName: Util.getResourceNameWithPrefix(`images-${props.env}`),
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    const httpApi = new apigatewayv2.CfnApi(this, "ThumbnailsApi", {
      name: Util.getResourceNameWithPrefix(`${props.env}`),
      protocolType: "HTTP",
      corsConfiguration: {
        allowCredentials: false,
        allowHeaders: ["*"],
        allowMethods: ["*"],
        allowOrigins: ["*"],
      },
    });

    imagesBucket.applyRemovalPolicy(RemovalPolicy.DESTROY);
    httpApi.applyRemovalPolicy(RemovalPolicy.DESTROY);

    const defaultStage = new apigatewayv2.CfnStage(this, "DefaultStage", {
      apiId: httpApi.ref,
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

    const jwtAuthorizer = new apigatewayv2.CfnAuthorizer(
      this,
      "ThumbnailsAuthorizer",
      {
        apiId: httpApi.ref,
        authorizerType: "JWT",
        name: Util.getResourceNameWithPrefix(`jwt-authorizer-${props.env}`),
        identitySource: ["$request.header.Authorization"],
        jwtConfiguration: {
          audience: [process.env.JWT_AUDIENCE],
          issuer: process.env.JWT_ISSUER,
        },
      }
    );

    new CfnOutput(this, "ImagesBucketArn", {
      exportName: Util.getResourceNameWithPrefix(
        `images-bucket-arn-${props.env}`
      ),
      value: imagesBucket.bucketArn,
    });

    new CfnOutput(this, "ImagesBucketName", {
      exportName: Util.getResourceNameWithPrefix(
        `images-bucket-name-${props.env}`
      ),
      value: imagesBucket.bucketName,
    });

    new CfnOutput(this, "ThumbnailsApiId", {
      exportName: Util.getResourceNameWithPrefix(`id-${props.env}`),
      value: httpApi.ref,
    });

    new CfnOutput(this, "ThumbnailsApiUrl", {
      exportName: Util.getResourceNameWithPrefix(`url-${props.env}`),
      value: httpApi.getAtt("ApiEndpoint").toString(),
    });

    new CfnOutput(this, "JwtAuthorizerId", {
      exportName: Util.getResourceNameWithPrefix(
        `jwt-authorizer-id-${props.env}`
      ),
      value: jwtAuthorizer.ref,
    });
  }
}
