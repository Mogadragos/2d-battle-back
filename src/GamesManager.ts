import { WorkerManager } from "./lib/WorkerManager";

import * as path from "path";
import {
    MainToWorker,
    WorkerToMain,
    WorkerToMainEvent,
} from "./game/types/WorkerEvent";
import { Server } from "./Server";
import { AppSocket } from "./types/SocketTypes";

export class GamesManager extends WorkerManager {
    // Use server for game events to avoid call to eventManager
    server: Server;

    constructor(server: Server) {
        super(path.resolve(__dirname, "game", "index.js"));

        this.server = server;

        global.eventManager.addEventListener(
            "roomReady",
            (event: {
                room: string;
                socketA: AppSocket;
                socketB: AppSocket;
            }) => {
                this.createWorker(event.room, event.socketA, event.socketB);
            }
        );
    }

    createWorker(room: string, socketA: AppSocket, socketB: AppSocket) {
        const worker = super.createWorker(room, socketA, socketB);

        this.initSocketEvent(socketA, room);
        this.initSocketEvent(socketB, room);

        worker.on("message", (event: WorkerToMainEvent) => {
            switch (event.type) {
                case WorkerToMain.LAUNCH:
                    this.server.to(room).emit("launch");
                    break;
                case WorkerToMain.UPDATE:
                    this.server.to(room).emit("update", event.data);
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

    initSocketEvent(socket: AppSocket, room: string) {
        socket.on("ready", () => {
            console.log(`Room ${room} // Socket ${socket.id} // Ready`);
            socket.data.worker?.postMessage({
                type: MainToWorker.READY,
                player: socket.id,
            });
        });

        socket.on("spawn", (type) => {
            console.log(`Room ${room} // Socket ${socket.id} // Spawn ${type}`);
            socket.data.worker?.postMessage({
                type: MainToWorker.SPAWN,
                player: socket.id,
                data: type,
            });
        });
    }
}
