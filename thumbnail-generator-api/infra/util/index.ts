export function getCdkPropsFromCustomProps(props: any) {
  return {
    env: {
      account: props.account,
      region: props.region,
    },
    stackName: props.name,
  };
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
  return ["sqs:SendMessage"];
}
