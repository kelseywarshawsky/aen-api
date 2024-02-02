/**
 * This function removes standard DynamoDB fields from an object so that those fields are not returned.
 *
 * The removed fields are based on convention only. The following fields are removed:
 * pk, sk, gsi1pk, gsi1sk, gsi2pk, gsi2sk, gsi3pk, gsi3sk, _ttl
 *
 * @export
 * @template DbType the database type of the object. This object must contain the pk and sk fields and may contain any of the other fields
 * @template Type the return type of the object. There is no validation done on the returned object, it is simply cast to the return type.
 * @param {DbType} dbItem the database item to clear
 * @return {*}  {Type}
 */
export declare function clearDb<DbType extends DbItem, Type>(dbItem: DbType): Type;
export interface DbItem {
    pk: string;
    sk: string;
    gsi1pk?: string;
    gsi1sk?: string;
    gsi2pk?: string;
    gsi2sk?: string;
    gsi3pk?: string;
    gsi3sk?: string;
    _ttl?: number;
}
export { };