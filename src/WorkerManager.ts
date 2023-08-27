import { Worker } from "node:worker_threads";
import * as path from "path";
import { Socket } from "socket.io";

export class WorkerManager {
    workers: Map<string, Worker>;
    rooms: Map<Worker, string>;

    constructor() {
        this.workers = new Map();
        this.rooms = new Map();

        global.eventManager.addEventListener(
            "disconnecting",
            (socket: Socket) => {
                for (const room of socket.rooms) {
                    if (room !== socket.id) {
                        this.terminateWorker(room);
                    }
                }
            }
        );

        global.eventManager.addEventListener(
            "roomReady",
            (event: { room: string; socketA: Socket; socketB: Socket }) => {
                this.createWorker(event.room, event.socketA, event.socketB);
            }
        );
    }

    createWorker(room: string, socketA: Socket, socketB: Socket) {
        const worker = new Worker(path.resolve(__dirname, "game", "index.js"));
        worker.on("error", (e) => {
            console.error("Worker error");
            console.error(e);
            global.eventManager.dispatchEvent("workerStopped", room);
        });
        worker.on("exit", (code) => {
            if (code !== 0)
                console.error(`Worker stopped with exit code ${code}`);
            global.eventManager.dispatchEvent("workerStopped", room);
        });
        worker.on("online", () => {
            this.workers.set(room, worker);
            socketA.data.worker = worker;
            socketB.data.worker = worker;
            console.log("worker created " + room);
        });

        worker.on("message", (msg) => console.log(msg));
    }

    terminateWorker(room: string) {
        const worker = this.workers.get(room);
        if (worker) {
            worker.terminate();
            this.workers.delete(room);
            this.rooms.delete(worker);

            console.log(`worker terminated (room ${room})`);
            global.eventManager.dispatchEvent("workerStopped", room);
        }
    }
}
