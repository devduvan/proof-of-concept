import { CustomStackProps } from "../interfaces";

export function getCdkPropsFromCustomProps(props: CustomStackProps) {
  let cdkProps = {
    stackName: props.name,
    env: {},
  };

  if (props.account || props.region) {
    cdkProps.env = {
      account: props.account,
      region: props.region,
    };
  }

  return cdkProps;
}

export function getResourceNameWithPrefix(resourceName: string) {
  return `thumbnail-generator-api-${resourceName}`;
}

export function getStackNameWithPrefix(resourceName: string) {
  return `thumbnail-generator-api-infra-${resourceName}`;
}

export function getReadActionsDynamoPolicyStatement() {
  return [
    "dynamodb:DescribeTable",
    "dynamodb:Query",
    "dynamodb:DescribeTable",
    "dynamodb:Scan",
  ];
}

export function getWriteActionsDynamoPolicyStatement() {
  return ["dynamodb:PutItem", "dynamodb:UpdateItem"];
}

export function getPublishActionsSnsPolicyStatement() {
  return ["sns:Publish"];
}

export function getSendActionsSqsPolicyStatement() {
  return [
    "sqs:SendMessage",
    "sqs:ReceiveMessage",
    "sqs:DeleteMessage",
    "sqs:GetQueueAttributes",
  ];
}

export function getReadActionsS3PolicyStatement() {
  return ["s3:GetObject", "s3:DeleteObject"];
}

export function getWriteActionsS3PolicyStatement() {
  return ["s3:PutObject"];
}
