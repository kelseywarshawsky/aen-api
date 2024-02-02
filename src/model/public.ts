import { DbItem } from "../utils/clear-db";

export type Character = {
    id: string;
    userId: number;
    name: string;
    campaignIds: string[];
    ancestry: string;
    bloodline?: string; // Optional since it doesn't have '!'
    lifePathIds?: string[]; // Optional
    languages: string[];
    isReady: boolean;
    class?: string; // Optional
    tradition?: string; // Optional
}

export type CharacterDb = Character & DbItem;