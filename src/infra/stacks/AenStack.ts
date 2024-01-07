
import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { get } from 'http';

export class AenCdkStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const api = new appsync.GraphqlApi(this, 'aen-api', {
            name: 'aen-api',
            schema: appsync.SchemaFile.fromAsset('schema/schema.graphql'),
        });

        //creates a DDB table
        const add_ddb_table = new dynamodb.Table(this, 'characters-table', {
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING,
            },
        });

        const dataSource = api.addDynamoDbDataSource('table-for-characters', add_ddb_table)

        const getCharacters = new appsync.AppsyncFunction(this, 'funcGetCharacters', {
            name: 'funcGetCharacters',
            api,
            dataSource,
            code: appsync.Code.fromInline(`
          export function request(ctx) {
          return { operation: 'Scan' };
          }

          export function response(ctx) {
          return ctx.result.items;
          }
  `),
            runtime: appsync.FunctionRuntime.JS_1_0_0,
        });

        const getCharacter = new appsync.AppsyncFunction(this, 'funcGetCharacter', {
            name: 'funcGetCharacter',
            api,
            dataSource,
            code: appsync.Code.fromInline(`
        export function request(ctx) {
            return {
                operation: 'GetItem',
                key: {
                    id: ctx.args.id // assuming the argument name is 'id' and it's passed in the query
                },
            };
        }

        export function response(ctx) {
            return ctx.result.item; // 'item' contains the retrieved single character
        }
    `),
            runtime: appsync.FunctionRuntime.JS_1_0_0,
        });


        const addCharacter = new appsync.AppsyncFunction(this, 'funcAddCharacter', {
            name: 'funcAddCharacter',
            api,
            dataSource,
            code: appsync.Code.fromInline(`
          export function request(ctx) {
            return {
            operation: 'PutItem',
            key: util.dynamodb.toMapValues({id: util.autoId()}),
            attributeValues: util.dynamodb.toMapValues(ctx.args.input),
            };
          }

          export function response(ctx) {
            return ctx.result;
          }
      `),
            runtime: appsync.FunctionRuntime.JS_1_0_0,
        });

        //         const updateCharacter = new appsync.AppsyncFunction(this, 'funcUpdateCharacter', {
        //             name: 'funcUpdateCharacter',
        //             api,
        //             dataSource,
        //             code: appsync.Code.fromInline(`
        // export function request(ctx) {
        //     let updateExp = "SET ";
        //     let expNames = {};
        //     let expValues = {};
        //     let separator = "";

        //     // Loop through input fields and build the update expression
        //     for (const key in ctx.args.input) {
        //         if (ctx.args.input.hasOwnProperty(key) && key !== "id") {
        //             updateExp += separator + "#n_" + key + " = :v_" + key;
        //             expNames["#n_" + key] = key;
        //             expValues[":v_" + key] = ctx.args.input[key];
        //             separator = ", ";
        //         }
        //     }

        //     return {
        //         operation: 'UpdateItem',
        //         key: {
        //             id: ctx.args.input.id
        //         },
        //         update: {
        //             expression: updateExp,
        //             expressionNames: expNames,
        //             expressionValues: expValues
        //         }
        //     };
        // }

        // export function response(ctx) {
        //     return ctx.result;
        // }
        // `),
        //             runtime: appsync.FunctionRuntime.JS_1_0_0,
        //         });



        // Adds a pipeline resolver with the get function
        new appsync.Resolver(this, 'pipeline-resolver-get-characters', {
            api,
            typeName: 'Query',
            fieldName: 'getCharacters',
            code: appsync.Code.fromInline(`
          export function request(ctx) {
          return {};
          }

          export function response(ctx) {
          return ctx.prev.result;
          }
  `),
            runtime: appsync.FunctionRuntime.JS_1_0_0,
            pipelineConfig: [getCharacters],
        });

        new appsync.Resolver(this, 'pipeline-resolver-get-character', {
            api,
            typeName: 'Query',
            fieldName: 'getCharacter',
            code: appsync.Code.fromInline(`
          export function request(ctx) {
          return {};
          }

          export function response(ctx) {
          return ctx.prev.result;
          }
  `),
            runtime: appsync.FunctionRuntime.JS_1_0_0,
            pipelineConfig: [getCharacter],
        });

        // Adds a pipeline resolver with the create function
        new appsync.Resolver(this, 'pipeline-resolver-create-character', {
            api,
            typeName: 'Mutation',
            fieldName: 'createCharacter',
            code: appsync.Code.fromInline(`
          export function request(ctx) {
          return {};
          }

          export function response(ctx) {
          return ctx.prev.result;
          }
  `),
            runtime: appsync.FunctionRuntime.JS_1_0_0,
            pipelineConfig: [addCharacter],
        });

        // Adds a pipeline resolver with the update function
        // new appsync.Resolver(this, 'pipeline-resolver-update-character', {
        //     api,
        //     typeName: 'Mutation',
        //     fieldName: 'updateCharacter',
        //     code: appsync.Code.fromInline(`
        //           export function request(ctx) {
        //           return {};
        //           }

        //           export function response(ctx) {
        //           return ctx.prev.result;
        //           }
        //   `),
        //     runtime: appsync.FunctionRuntime.JS_1_0_0,
        //     pipelineConfig: [updateCharacter],
        // });

    }
}