
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { Architecture, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import path = require('path');
import { GraphqlApi, LambdaDataSource, Resolver } from 'aws-cdk-lib/aws-appsync';
import { Stack, Duration } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

type Props = {
    env: {
        account: string | undefined;
        region: string | undefined;
    }
    table: Table;
}
export class AenCharacterCdkStack extends Stack {
    public readonly lambdaFunction: NodejsFunction;
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id);
        const stack = Stack.of(this);
        const { account, region } = props.env;
        const { table } = props;


        const lambdaFunction = new NodejsFunction(this, 'Handler', {
            architecture: Architecture.ARM_64,
            awsSdkConnectionReuse: true,
            bundling: {
                minify: true,
                sourceMap: true,
            },
            memorySize: 1024,
            reservedConcurrentExecutions: 10,
            runtime: Runtime.NODEJS_20_X,
            timeout: Duration.seconds(3),
            tracing: Tracing.ACTIVE,
            description: 'AppSync Request Handler for Aen',
            entry: path.join(__dirname, 'handler.ts'),
            environment: {
                ACCOUNT: account ? account : '',
                REGION: region ? region : 'us-east-1',
                TABLE_NAME: table.tableName,
            }
        });


        this.lambdaFunction = lambdaFunction;

        const api = new GraphqlApi(this, 'aen-api', {
            name: 'aen-api',
            schema: appsync.SchemaFile.fromAsset('schema/schema.graphql'),
        });

        table.grantReadWriteData(lambdaFunction);

        const dynamoDbPolicy = new PolicyStatement({
            actions: ['dynamodb:GetItem', 'dynamodb:PutItem', 'dynamodb:Scan', 'dynamodb:Query', 'dynamodb:UpdateItem', 'dynamodb:DeleteItem'],
            resources: [table.tableArn],
        });

        lambdaFunction.addToRolePolicy(dynamoDbPolicy);

        const lambdaDataSource = new LambdaDataSource(this, 'AenLambdaData', {
            api,
            lambdaFunction,
            description: 'Lambda Data source for Aen',
        });

        const dynamoDbDataSource = api.addDynamoDbDataSource('characters', table);

        // queries
        new Resolver(this, 'getCharacters', {
            api, fieldName: 'getCharacters', typeName: 'Query', dataSource: dynamoDbDataSource, requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(), // DynamoDB specific template
            responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(), // DynamoDB specific template
        })

        // mutations
        new Resolver(this, 'createCharacter', {
            api, fieldName: 'createCharacter', typeName: 'Mutation', dataSource: lambdaDataSource,
            requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(), // Default Lambda request template
            responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
        })

        new Resolver(this, 'testMutation', {
            api, fieldName: 'testMutation', typeName: 'Mutation', dataSource: lambdaDataSource,
        })

    }
}