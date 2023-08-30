import { Worker } from "node:worker_threads";
import { Socket } from "socket.io";

export class WorkerManager {
    path: string;
    workers: Map<string, Worker>;
    rooms: Map<Worker, string>;

    constructor(path: string) {
        this.path = path;
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
    }

    createWorker(room: string, socketA: Socket, socketB: Socket) {
        const worker = new Worker(this.path, {
            workerData: { playerA: socketA.id, playerB: socketB.id },
        });
        worker.on("error", (e) => this.handleError(e, room));
        worker.on("exit", (code) => this.handleExit(code, room));
        worker.on("online", () =>
            this.handleOnline(worker, room, socketA, socketB)
        );

        return worker;
    }

    handleError(e: Error, room: string) {
        console.error("Worker error");
        console.error(e);
        global.eventManager.dispatchEvent("workerStopped", room);
    }

    handleExit(code: number, room: string) {
        if (code !== 0) console.error(`Worker stopped with exit code ${code}`);
        global.eventManager.dispatchEvent("workerStopped", room);
    }

    handleOnline(
        worker: Worker,
        room: string,
        socketA: Socket,
        socketB: Socket
    ) {
        this.workers.set(room, worker);
        socketA.data.worker = worker;
        socketB.data.worker = worker;

        global.eventManager.dispatchEvent("workerReady", {
            socketA,
            socketB,
        });
    }

    terminateWorker(room: string) {
        const worker = this.workers.get(room);
        if (worker) {
            worker.terminate();
            this.workers.delete(room);
            this.rooms.delete(worker);

            global.eventManager.dispatchEvent("workerStopped", room);
        }
    }
}
