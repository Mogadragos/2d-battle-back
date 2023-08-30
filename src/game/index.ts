import "module-alias/register";

import {
    parentPort as undefParentPort,
    workerData as anyData,
} from "node:worker_threads";

import { WorkerData } from "./types/WorkerData";
import { GameEngine } from "./GameEngine";

var parentPort = undefParentPort!;
var workerData: WorkerData = anyData;

if (parentPort) {
    const gameEngine = new GameEngine(parentPort, workerData);
}
