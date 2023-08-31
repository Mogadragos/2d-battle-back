import { AgeEnum } from "@shared/shared-types/game/AgeEnum";

export type Player = {
    id: string;
    playerA: boolean;
    spawnX: number;
    ready: boolean;

    age: AgeEnum;
    xp: number;
    gold: number;
};
