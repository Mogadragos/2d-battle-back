import { EntityEnum } from "@shared/shared-types/game-types";

export type ToBuild = { type: EntityEnum; time: number; ready: boolean };

export type LocalPlayer = {
    ready: boolean;
    toBuild: Array<ToBuild>;
    currentBuild?: ToBuild;
    buildTimer: number;
};
