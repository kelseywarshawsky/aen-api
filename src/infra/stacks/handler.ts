import { AppSyncResolverEvent, Context } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand, QueryCommand, ScanCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});
export const handler = async (event: AppSyncResolverEvent<any, any>) => {
    const { arguments: args, info } = event;
    const { fieldName, parentTypeName } = info;
    const client = new DynamoDBClient({});

    if (parentTypeName === 'Query') {
        switch (fieldName) {
            case 'getCharacters': {
                const command = new ScanCommand({
                    TableName: 'characters-table',
                });
                try {
                    const data = await client.send(command);
                    return data.Items;
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

    if (parentTypeName === 'Mutation') {
        switch (fieldName) {
            case 'createCharacter': {
                const command = new PutItemCommand({
                    TableName: 'characters-table',
                    Item: {
                        'id': { S: args.input.id },
                    },
                });
                try {
                    const data = await client.send(command);
                    console.log(data);
                    return { statusCode: 200, body: 'Character added successfully!' };
                } catch (err) {
                    console.error(err);
                    return { statusCode: 500, body: 'Failed to add character' };
                }
            }
        }
    }
    return null;
}
