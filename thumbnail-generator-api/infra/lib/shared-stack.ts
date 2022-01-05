import { CfnOutput, Duration, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

import { aws_s3 as s3 } from "aws-cdk-lib";

import * as Util from "../util";
import { CustomStackProps } from "../interfaces";

export class SharedStack extends Stack {
  constructor(scope: Construct, id: string, props: CustomStackProps) {
    super(scope, id, Util.getCdkPropsFromCustomProps(props));

    const imagesBucket = new s3.Bucket(this, "ImagesBucket", {
      bucketName: Util.getResourceNameWithPrefix(`images-${props.env}`),
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    new CfnOutput(this, "ImagesBucketArn", {
      exportName: Util.getResourceNameWithPrefix(
        `images-bucket-arn-${props.env}`
      ),
      value: imagesBucket.bucketArn,
    });
  }
}
