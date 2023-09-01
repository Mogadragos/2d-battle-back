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
    Entity,
    EntityEnum,
    Game,
    Player,
    PlayerEnum,
} from "@shared/shared-types/game-types";
import { ENTITY_DATA, PLAYER_DATA } from "@shared/data";

export class GameEngine extends Engine {
    // technical
    parentPort: MessagePort;

    // game
    playerA: Player;
    playerB: Player;
    players: Record<string, Player>;

    gameData: Game;

    constructor(parentPort: MessagePort, workerData: WorkerData, fps = 20) {
        super(fps);

        this.parentPort = parentPort;

        this.playerA = Utils.initPlayer(PlayerEnum.PLAYER_A);
        this.playerB = Utils.initPlayer(PlayerEnum.PLAYER_B);
        this.players = {
            [workerData.playerA]: this.playerA,
            [workerData.playerB]: this.playerB,
        };

        this.gameData = {
            entities: [],
            players: {
                [PlayerEnum.PLAYER_A]: this.playerA,
                [PlayerEnum.PLAYER_B]: this.playerB,
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
        this.players[player].ready = true;
        if (this.playerA.ready && this.playerB.ready) {
            this.launch();
        }
    }

    trySpawn(event: { player: string; data: EntityEnum }) {
        const player = this.players[event.player];
        const entity = ENTITY_DATA[event.data];
        const remaining = player.gold - entity.cost;
        if (remaining > -1) {
            player.gold = remaining;
            // TODO add delay to game data (once)
            this.spawn(player, event.data);
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

        this.parentPort.postMessage({
            type: WorkerToMain.UPDATE,
            data: this.gameData,
        });
    }
}
