import { parentPort } from "node:worker_threads";

if (parentPort) {
    parentPort.postMessage("I'm alive");

    parentPort.on("event", () => {});
}
