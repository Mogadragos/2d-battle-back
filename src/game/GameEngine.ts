import { MessagePort } from "node:worker_threads";
import {
    MainToWorker,
    MainToWorkerEvent,
    WorkerToMain,
} from "../types/WorkerEvent";

import { Engine } from "./lib/Engine";

import { Player } from "./types/Player";
import { WorkerData } from "./types/WorkerData";

export class GameEngine extends Engine {
    // technical
    parentPort: MessagePort;

    // game
    playerA: Player;
    playerB: Player;
    players: Record<string, Player>;

    gameData: any;

    constructor(parentPort: MessagePort, workerData: WorkerData, fps = 20) {
        super(fps);

        this.parentPort = parentPort;

        this.playerA = {
            id: workerData.playerA,
            ready: false,
        };
        this.playerB = {
            id: workerData.playerB,
            ready: false,
        };
        this.players = {
            [workerData.playerA]: this.playerA,
            [workerData.playerB]: this.playerB,
        };

        this.parentPort.on("message", (event: MainToWorkerEvent) => {
            switch (event.type) {
                case MainToWorker.READY:
                    this.setReady(event.data);
                    break;
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

    launch() {
        this.parentPort.postMessage({
            type: WorkerToMain.LAUNCH,
        });

        super.launch();
    }

    update(delta: number) {
        this.parentPort.postMessage({
            type: WorkerToMain.UPDATE,
            data: delta,
        });
    }
}
