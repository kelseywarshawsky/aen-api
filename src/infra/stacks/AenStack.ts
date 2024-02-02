
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { Architecture, IFunction, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import path = require('path');
import { GraphqlApi, IGraphqlApi, LambdaDataSource, Resolver } from 'aws-cdk-lib/aws-appsync';
import { RemovalPolicy, Stack, Duration } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';

type Props = {
    env: {
        account: string | undefined;
        region: string | undefined;
    }
}
export class AenCdkStack extends Stack {
    public readonly lambdaFunction: NodejsFunction;
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id);
        const stack = Stack.of(this);
        const { account, region } = props.env;

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
                REGION: region ? region : 'us-east-1'
            }
        });

        this.lambdaFunction = lambdaFunction;

        const api = new GraphqlApi(this, 'aen-api', {
            name: 'aen-api',
            schema: appsync.SchemaFile.fromAsset('schema/schema.graphql'),
        });

        const add_ddb_table = new Table(this, 'characters-table', {
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

        const dataSource = api.addDynamoDbDataSource('table-for-characters', add_ddb_table);

        // queries
        new Resolver(this, 'getCharacters', {
            api, fieldName: 'getCharacters', typeName: 'Query', dataSource, requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(), responseMappingTemplate: appsync.MappingTemplate.lambdaResult()
        })

        // mutations
        new Resolver(this, 'createCharacter', {
            api, fieldName: 'createCharacter', typeName: 'Mutation', dataSource, requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(), responseMappingTemplate: appsync.MappingTemplate.lambdaResult()
        })

    }
}