import { CfnOutput, Duration, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

import {
  aws_iam as iam,
  aws_dynamodb as dynamodb,
  aws_sns as sns,
} from "aws-cdk-lib";

import * as Util from "../util";
import { CustomStackProps } from "../interfaces";

export class ThumbnailsStack extends Stack {
  constructor(scope: Construct, id: string, props: CustomStackProps) {
    super(scope, id, Util.getCdkPropsFromCustomProps(props));
  }
}
