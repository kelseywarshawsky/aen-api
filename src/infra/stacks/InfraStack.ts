/* eslint-disable import/no-extraneous-dependencies */
import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { AttributeType, BillingMode, StreamViewType, Table, TableEncryption } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { AenCharacterCdkStack } from './AenStack';

export class Aen extends Stack {
    constructor(scope: Construct, id: string) {
        super(scope, id);
        const table = new Table(this, 'characters', {
            partitionKey: {
                name: 'pk',
                type: AttributeType.STRING,
            },
            sortKey: {
                name: 'sk',
                type: AttributeType.STRING,
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.RETAIN,
        });

        new AenCharacterCdkStack(this, 'AenCharacterCdkStack', {
            env: { account: process.env.ACCOUNT, region: process.env.REGION },
            table,
        });
    }
}