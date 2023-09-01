import { ENTITY_DATA, PLAYER_DATA } from "@shared/data";
import {
    AgeEnum,
    AnimEnum,
    Entity,
    EntityEnum,
    Player,
    PlayerEnum,
} from "@shared/shared-types/game-types";

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

    static resetEntity(
        player: Player,
        entity: Entity,
        type: EntityEnum
    ): Entity {
        const player_data = PLAYER_DATA[player.playerA];
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
