import { Worker } from "node:worker_threads";
import * as path from "path";
import { Socket } from "socket.io";

export class WorkerManager {
    workers: Map<string, Worker>;

    constructor() {
        this.workers = new Map();

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

        global.eventManager.addEventListener("joinRoom", (room: string) => {
            this.createWorker(room);
        });
    }

    createWorker(room: string) {
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
            console.log("worker created " + room);
        });

        worker.on("message", (msg) => console.log(msg));
    }

    terminateWorker(room: string) {
        const worker = this.workers.get(room);
        if (worker) {
            worker.terminate();
            console.log(`worker terminated (room ${room})`);
            global.eventManager.dispatchEvent("workerStopped", room);
        }
    }
}
