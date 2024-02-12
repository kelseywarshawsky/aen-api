import { AppSyncResolverEvent, Context } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand, QueryCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { toCharacter, toCharacterDb } from '../../data/character/transform';
import { CharacterDb } from '../../model/public';
import { ulid } from 'ulid';

const client = new DynamoDBClient({});
export const handler = async (event: AppSyncResolverEvent<any, any>) => {
    const { arguments: args, info } = event;
    const { fieldName, parentTypeName } = info;
    const client = new DynamoDBClient({});

    if (parentTypeName === 'Query') {
        switch (fieldName) {
            case 'getCharacters': {
                const characters = await client.send(new ScanCommand({
                    TableName: process.env.TABLE_NAME,
                }),
                );
                return characters?.Items ? characters.Items.map((item) => toCharacter(item as CharacterDb)) : [];
            }
        }
    }

    if (parentTypeName === 'Mutation') {
        switch (fieldName) {
            case 'createCharacter': {
                const id = ulid();
                await client.send(
                    new PutCommand({
                        Item: toCharacterDb({ id, ...args.input }),
                        TableName: process.env.TABLE_NAME,
                        ConditionExpression: 'attribute_not_exists(pk)',
                    }),
                );
                return args.input;
            }
            case 'testMutation': {
                try {
                    const result = await client.send(
                        new PutCommand({
                            Item: args.input,
                            TableName: process.env.TABLE_NAME,
                            ConditionExpression: 'attribute_not_exists(pk)',
                        }),
                    );
                    // Assuming a successful operation returns the item or a confirmation message
                    return result.toString();
                } catch (error) {
                    console.error("Error in testMutation:", error);
                    // Return error details as part of the GraphQL response
                    // Ensure your GraphQL schema can handle this error structure in the response
                    return error.toString() as unknown as string;
                }
            }

        }

    }
    return null;
}
