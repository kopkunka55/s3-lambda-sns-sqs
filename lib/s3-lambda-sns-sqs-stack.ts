import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as sns from "@aws-cdk/aws-sns";
import * as sns_sub from "@aws-cdk/aws-sns-subscriptions";
import * as lambda from "@aws-cdk/aws-lambda";
import * as sqs from "@aws-cdk/aws-sqs";
import { S3EventSource } from "@aws-cdk/aws-lambda-event-sources";
import * as iam from '@aws-cdk/aws-iam';

export class S3LambdaSnsSqsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const bucket = new s3.Bucket(this, "my-s3-dev", {
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    const topic = new sns.Topic(this, "my-sns-dev", {});

    const publisTopichHanlder = new lambda.Function(this, "my-lambda-dev", {
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: cdk.Duration.seconds(5.0),
      code: lambda.Code.asset("function"),
      handler: "s3-handler.rekognitionHandler",
      environment: {
        TOPIC_ARN: topic.topicArn,
      }
    });

    publisTopichHanlder.addEventSource(
      new S3EventSource(bucket, {
        events: [s3.EventType.OBJECT_CREATED],
      })
    );

    bucket.grantRead(publisTopichHanlder);
    topic.grantPublish(publisTopichHanlder);

    const queue = new sqs.Queue(this, "my-dev", {
      visibilityTimeout: cdk.Duration.seconds(300),
    });

    topic.addSubscription(
      new sns_sub.SqsSubscription(queue, {
        rawMessageDelivery: true,
      })
    );

    publisTopichHanlder.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ["*"],
      actions: [
        "rekognition:DetectLabels"
      ]
    }))
  };
}
