import { WorkerManager } from "./lib/WorkerManager";

import * as path from "path";
import { Socket } from "socket.io";
import {
    MainToWorker,
    WorkerToMain,
    WorkerToMainEvent,
} from "./types/WorkerEvent";

export class AppWorkerManager extends WorkerManager {
    constructor() {
        super(path.resolve(__dirname, "game", "index.js"));

        global.eventManager.addEventListener(
            "roomReady",
            (event: { room: string; socketA: Socket; socketB: Socket }) => {
                this.createWorker(event.room, event.socketA, event.socketB);
            }
        );

        global.eventManager.addEventListener("clientReady", (socket: Socket) =>
            socket.data.worker.postMessage({
                type: MainToWorker.READY,
                data: socket.id,
            })
        );
    }

    createWorker(room: string, socketA: Socket, socketB: Socket) {
        const worker = super.createWorker(room, socketA, socketB);

        worker.on("message", (event: WorkerToMainEvent) => {
            switch (event.type) {
                case WorkerToMain.LAUNCH:
                    global.eventManager.dispatchEvent("launch", room);
                    break;
                case WorkerToMain.UPDATE:
                    console.log("Update");
                    console.log(event.data);
                    break;
                case WorkerToMain.ERROR:
                default:
                    console.log("Worker error");
                    console.log(event.data);
                    break;
            }
        });

        return worker;
    }
}
