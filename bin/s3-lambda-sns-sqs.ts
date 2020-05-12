#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { S3LambdaSnsSqsStack } from '../lib/s3-lambda-sns-sqs-stack';

const app = new cdk.App();
new S3LambdaSnsSqsStack(app, 'S3LambdaSnsSqsStack');
