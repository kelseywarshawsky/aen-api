import { Character, CharacterDb } from "../../model/public";
import { clearDb } from "../../utils/clear-db";

/**
 * Returns a Character object from a CharacterDb object
 *
 * @export
 * @param {CharacterDb} CharacterDb
 * @return {*}  {Character}
 */
export function toCharacter(CharacterDb: CharacterDb): Character {
    return clearDb(CharacterDb);
}

/**
 * Returns a CharacterDb object from a Character object
 *
 * @export
 * @param {Character} Character
 * @return {*}  {CharacterDb}
 */
export function toCharacterDb(Character: Character): CharacterDb {
    return {
        ...Character,
        pk: CharacterPk(Character),
        sk: CharacterSk(Character),
    };
}

/**
 * Returns the partition key value for a Character record
 *
 * @export
 * @param {Pick<Character, 'companyId'>} { companyId }
 * @return {*}  {string}
 */
export function CharacterPk({ id }: Pick<Character, 'id'>): string {
    return id;
}

export function CharacterSk({ userId }: Pick<Character, 'userId'>): string {
    return `Character|${userId}`;
}