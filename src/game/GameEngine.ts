import { MessagePort } from "node:worker_threads";
import {
    MainToWorker,
    MainToWorkerEvent,
    WorkerToMain,
} from "./types/WorkerEvent";
import { WorkerData } from "./types/WorkerData";

import { Engine } from "./lib/Engine";
import { Utils } from "./Utils";

import {
    AnimEnum,
    BuildEnum,
    Entity,
    EntityEnum,
    Game,
    Player,
    PlayerEnum,
} from "@shared/shared-types/game-types";
import { PlayerData } from "./types/PlayerData";

import { ENTITY_DATA } from "@shared/data";

export class GameEngine extends Engine {
    // technical
    parentPort: MessagePort;

    // game
    playerDataA: PlayerData;
    playerDataB: PlayerData;
    playersById: Record<string, PlayerData>;

    allEntities: Entity[];

    gameData: Game;

    constructor(parentPort: MessagePort, workerData: WorkerData, fps = 20) {
        super(fps);

        this.parentPort = parentPort;

        this.playerDataA = Utils.initPlayerData(PlayerEnum.PLAYER_A);
        this.playerDataB = Utils.initPlayerData(PlayerEnum.PLAYER_B);
        this.playersById = {
            [workerData.playerA]: this.playerDataA,
            [workerData.playerB]: this.playerDataB,
        };

        this.allEntities = [];

        this.gameData = {
            [PlayerEnum.PLAYER_A]: this.playerDataA.player,
            [PlayerEnum.PLAYER_B]: this.playerDataB.player,
        };

        this.parentPort.on("message", (event: MainToWorkerEvent) => {
            switch (event.type) {
                case MainToWorker.READY:
                    this.setReady(event.player);
                    break;
                case MainToWorker.SPAWN:
                    this.trySpawn(event);
                default:
                    // Error ?
                    break;
            }
        });
    }

    setReady(player: string) {
        this.playersById[player].local.ready = true;
        if (this.playerDataA.local.ready && this.playerDataB.local.ready) {
            this.launch();
        }
    }

    trySpawn(event: MainToWorkerEvent<EntityEnum>) {
        const { local, player } = this.playersById[event.player];
        const entity = ENTITY_DATA[event.data];
        const remainingGold = player.gold - entity.cost;
        if (player.buildStatus < BuildEnum.FIVE && remainingGold > -1) {
            player.gold = remainingGold;
            player.buildStatus++;
            local.toBuild.push({
                type: event.data,
                time: entity.buildTime,
                ready: false,
            });
        }
    }

    launch() {
        this.parentPort.postMessage({
            type: WorkerToMain.LAUNCH,
        });

        super.launch();
    }

    update(delta: number) {
        // Move entities
        this.moveEntities(this.playerDataA, delta);
        this.moveEntities(this.playerDataB, delta);

        // Move -> Collide / Move OR Attack -> Attack / Move

        // Update death status

        // Update to build
        this.updateToBuild(this.playerDataA, delta);
        this.updateToBuild(this.playerDataB, delta);

        // Send update
        this.parentPort.postMessage({
            type: WorkerToMain.UPDATE,
            data: this.gameData,
        });
    }

    moveEntities({ player }: PlayerData, delta: number) {
        // If hp < 0 -> anim.DEATH + remove from list + remove from attacking ennemies (+ todo make accessible from pool after death animation)
        // If previous dead -> anim.WALK
        // Else
        // If anim.ATTACK -> check ennemy alive
        // --> YES : Apply damage + continue;
        // --> NO : anim.WALK
        // If !anim.WALK -> stop loop
        // move
        for (const entity of player.entities) {
            switch (entity.anim) {
                case AnimEnum.WALK:
                    entity.x += entity.speed * delta;
                    break;
            }
        }
    }

    updateToBuild({ player, local }: PlayerData, delta: number) {
        if (!local.currentBuild && local.toBuild[0]) {
            local.currentBuild = local.toBuild.shift()!;
            player.buildTime = local.currentBuild.time;
        }
        if (local.currentBuild) {
            if (!local.currentBuild.ready) {
                local.buildTimer += delta;
                if (!(local.buildTimer < local.currentBuild.time)) {
                    local.currentBuild.ready = true;
                }
            }
            if (
                local.currentBuild.ready &&
                Utils.canSpawn(player, local.currentBuild.type, player.entities)
            ) {
                this.spawn(player, local.currentBuild.type);
                local.currentBuild = undefined;
                local.buildTimer = 0;
            }
        }
    }

    spawn(player: Player, type: EntityEnum) {
        const entityInPool = this.allEntities.find((entity) => !entity.alive);

        if (entityInPool) {
            Utils.resetEntity(player, entityInPool, type);
        } else {
            const entity = Utils.resetEntity(
                player,
                { id: this.allEntities.length + 1 } as Entity,
                type
            );
            this.allEntities.push(entity);
            player.entities.push(entity);
        }

        player.buildTime = 0;
        player.buildStatus--;
    }
}
