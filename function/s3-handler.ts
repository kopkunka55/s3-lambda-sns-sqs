import { S3Handler } from "aws-lambda";
import { SNS, Rekognition } from "aws-sdk";

const sns = new SNS();
const rekognition = new Rekognition();
const TOPIC_ARN = process.env.TOPIC_ARN;

export const rekognitionHandler: S3Handler = async (event) => {
  const s3Event = event.Records[0].s3;

  const detectedLabels = await rekognition
    .detectLabels({
      Image: {
        S3Object: {
          Bucket: s3Event.bucket.name,
          Name: s3Event.object.key,
        },
      },
    })
    .promise();

  await sns.publish({
    TopicArn: TOPIC_ARN,
    Message: JSON.stringify(detectedLabels.Labels),
  }).promise()
};
