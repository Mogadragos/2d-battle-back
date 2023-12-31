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

            entities: [],
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
        const entity_data = ENTITY_DATA[type];
        entity.alive = true;
        entity.x = player_data.spawnX;
        entity.speed = player_data.playerA
            ? entity_data.speed
            : -entity_data.speed;
        entity.type = type;
        entity.anim = AnimEnum.WALK;
        return entity;
    }

    static canSpawn(
        player: Player,
        entity: EntityEnum,
        entities: Entity[]
    ): boolean {
        if (entities.length < 1) {
            return true;
        }

        const player_data = PLAYER_DATA[player.player];
        const entity_half_width = ENTITY_DATA[entity].width / 2;
        const last_entity = entities[entities.length - 1];
        const last_entity_half_width = ENTITY_DATA[last_entity.type].width / 2;

        if (player_data.playerA) {
            return (
                player_data.spawnX + entity_half_width <
                last_entity.x - last_entity_half_width
            );
        }
        return (
            player_data.spawnX - entity_half_width >
            last_entity.x + last_entity_half_width
        );
    }
}
