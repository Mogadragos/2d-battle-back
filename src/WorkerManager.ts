import {
    Worker,
    isMainThread,
    parentPort,
    workerData,
} from "node:worker_threads";
import { ServerType } from "./types/ServerType";
import * as path from "path";

export class WorkerManager {
    workers: Map<string, Worker>;
    io: ServerType;

    constructor(io: ServerType) {
        this.workers = new Map();
        this.io = io;
    }

    createWorker(room: string) {
        const worker = new Worker(path.resolve(__dirname, "game.js"));
        worker.on("error", (e) => {
            console.error("Worker error");
            console.error(e);
            this.io.to(room).emit("close");
        });
        worker.on("exit", (code) => {
            this.io.to(room).emit("close");
            if (code !== 0)
                console.error(`Worker stopped with exit code ${code}`); // => Worker stopped with exit code 1
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
            this.io.to(room).emit("close");
            console.log(`worker terminated (room ${room})`);
        }
    }
}
