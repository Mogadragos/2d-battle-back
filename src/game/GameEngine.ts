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

        this.gameData = {
            entities: [],
            players: {
                [PlayerEnum.PLAYER_A]: this.playerDataA.player,
                [PlayerEnum.PLAYER_B]: this.playerDataB.player,
            },
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
        for (const entity of this.gameData.entities) {
            entity.x += entity.speed * delta;
        }

        this.updateToBuild(this.playerDataA, delta);
        this.updateToBuild(this.playerDataB, delta);

        this.parentPort.postMessage({
            type: WorkerToMain.UPDATE,
            data: this.gameData,
        });
    }

    updateToBuild({ player, local }: PlayerData, delta: number) {
        if (!local.currentBuild && local.toBuild[0]) {
            local.currentBuild = local.toBuild.shift()!;
            player.buildTime = local.currentBuild.time;
        }
        if (local.currentBuild) {
            local.buildTimer += delta;
            if (!(local.buildTimer < local.currentBuild.time)) {
                this.spawn(player, local.currentBuild.type);
                local.currentBuild = undefined;
                local.buildTimer = 0;
            }
        }
    }

    spawn(player: Player, type: EntityEnum) {
        const entityInPool = this.gameData.entities.find(
            (entity) => !entity.alive
        );

        if (entityInPool) {
            Utils.resetEntity(player, entityInPool, type);
        } else {
            this.gameData.entities.push(
                Utils.resetEntity(
                    player,
                    { id: this.gameData.entities.length + 1 } as Entity,
                    type
                )
            );
        }

        player.buildTime = 0;
        player.buildStatus--;
    }
}
