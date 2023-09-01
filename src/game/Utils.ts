import { AgeEnum, Player, PlayerEnum } from "@shared/shared-types/game-types";

export class Utils {
    static initPlayer(playerA: PlayerEnum): Player {
        return {
            playerA: playerA,
            ready: false,

            age: AgeEnum.ONE,
            xp: 0,
            gold: 100,
        };
    }
}
