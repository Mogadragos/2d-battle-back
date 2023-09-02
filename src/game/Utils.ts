import { ENTITY_DATA, PLAYER_DATA } from "@shared/data";
import {
    AgeEnum,
    AnimEnum,
    Entity,
    EntityEnum,
    Player,
    PlayerEnum,
} from "@shared/shared-types/game-types";
import { BuildEnum } from "@shared/shared-types/game/Build";
import { LocalPlayer } from "./types/LocalPlayer";

export class Utils {
    static initPlayer(player: PlayerEnum): Player {
        return {
            player: player,

            age: AgeEnum.ONE,
            xp: 0,
            gold: 1000,

            buildTime: 0,
            buildStatus: BuildEnum.ZERO,
        };
    }
    static initLocalPlayer(): LocalPlayer {
        return {
            ready: false,
            toBuild: [],
            buildTimer: 0,
        };
    }
    static initPlayerData(player: PlayerEnum) {
        return {
            local: this.initLocalPlayer(),
            player: this.initPlayer(player),
        };
    }

    static resetEntity(
        player: Player,
        entity: Entity,
        type: EntityEnum
    ): Entity {
        const player_data = PLAYER_DATA[player.player];
        entity.alive = true;
        entity.playerA = player_data.playerA;
        entity.x = player_data.spawnX;
        entity.speed = player_data.playerA
            ? ENTITY_DATA[type].speed
            : -ENTITY_DATA[type].speed;
        entity.type = type;
        entity.anim = AnimEnum.WALK;
        return entity;
    }
}
