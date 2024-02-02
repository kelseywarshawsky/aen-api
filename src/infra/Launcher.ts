#!/usr/bin/env node
import 'source-map-support/register';
import { AenCdkStack } from './stacks/AenStack';
import { App } from 'aws-cdk-lib';

const app = new App();
new AenCdkStack(app, 'AenCdkStack', {
    env: { account: process.env.ACCOUNT, region: process.env.REGION },
});