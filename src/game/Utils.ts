import { AgeEnum } from "@shared/shared-types/game/AgeEnum";
import { Player } from "./types/Player";

export class Utils {
    static initPlayer(id: string, playerA: boolean): Player {
        return {
            id: id,
            playerA: playerA,
            spawnX: playerA ? 48 : 2000,
            ready: false,

            age: AgeEnum.ONE,
            xp: 0,
            gold: 100,
        };
    }
}
