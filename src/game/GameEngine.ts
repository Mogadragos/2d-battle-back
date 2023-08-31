import { MessagePort } from "node:worker_threads";
import {
    MainToWorker,
    MainToWorkerEvent,
    WorkerToMain,
} from "../types/WorkerEvent";

import { Engine } from "./lib/Engine";

import { Player } from "./types/Player";
import { WorkerData } from "./types/WorkerData";
import {
    AnimEnum,
    TypeEnum,
    EntityData,
    GameData,
    TYPE_DATA,
} from "@shared/shared-types/game-types";
import { Utils } from "./Utils";

export class GameEngine extends Engine {
    // technical
    parentPort: MessagePort;

    // game
    playerA: Player;
    playerB: Player;
    players: Record<string, Player>;

    gameData: GameData;

    constructor(parentPort: MessagePort, workerData: WorkerData, fps = 20) {
        super(fps);

        this.parentPort = parentPort;

        this.playerA = Utils.initPlayer(workerData.playerA, true);
        this.playerB = Utils.initPlayer(workerData.playerB, false);
        this.players = {
            [workerData.playerA]: this.playerA,
            [workerData.playerB]: this.playerB,
        };

        this.gameData = {
            entities: [],
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
        this.players[player].ready = true;
        if (this.playerA.ready && this.playerB.ready) {
            this.launch();
        }
    }

    trySpawn(event: { player: string; data: TypeEnum }) {
        const player = this.players[event.player];
        const entity = TYPE_DATA[event.data];
        const remaining = player.gold - entity.cost;
        if (remaining > -1) {
            player.gold = remaining;
            // TODO add delay to game data (once)
            this.spawn(player, event.data);
        }
    }

    spawn(player: Player, type: TypeEnum) {
        const entityInPool = this.gameData.entities.find(
            (entity) => !entity.alive
        );

        if (entityInPool) {
            this.resetEntity(player, entityInPool, type);
        } else {
            this.gameData.entities.push(
                this.resetEntity(
                    player,
                    { id: this.gameData.entities.length + 1 } as EntityData,
                    type
                )
            );
        }
    }

    resetEntity(player: Player, entity: EntityData, type: TypeEnum) {
        entity.alive = true;
        entity.playerA = player.playerA;
        entity.x = player.spawnX;
        entity.type = type;
        entity.anim = AnimEnum.WALK;
        return entity;
    }

    launch() {
        this.parentPort.postMessage({
            type: WorkerToMain.LAUNCH,
        });

        super.launch();
    }

    update(delta: number) {
        this.parentPort.postMessage({
            type: WorkerToMain.UPDATE,
            data: this.gameData,
        });
    }
}
