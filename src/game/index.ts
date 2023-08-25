import {
    Worker,
    isMainThread,
    parentPort,
    workerData,
} from "node:worker_threads";

parentPort?.postMessage("I'm alive");
