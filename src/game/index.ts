import {
    parentPort as undefParentPort,
    workerData as anyData,
} from "node:worker_threads";

import {
    MainToWorker,
    MainToWorkerEvent,
    WorkerToMain,
} from "../types/WorkerEvent";

var workerData: {
    playerA: string;
    playerB: string;
} = anyData;

var parentPort = undefParentPort!;

if (parentPort) {
    const playerA = {
        id: workerData.playerA,
        ready: false,
    };
    const playerB = {
        id: workerData.playerB,
        ready: false,
    };
    const players = {
        [workerData.playerA]: playerA,
        [workerData.playerB]: playerB,
    };

    parentPort.on("message", (event: MainToWorkerEvent) => {
        switch (event.type) {
            case MainToWorker.READY:
                players[event.data].ready = true;
                if (playerA.ready && playerB.ready) {
                    parentPort.postMessage({ type: WorkerToMain.LAUNCH });
                }
                break;
            default:
                console.log("Worker error");
                break;
        }
    });
}
