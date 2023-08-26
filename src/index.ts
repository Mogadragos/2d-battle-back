import "module-alias/register";

import { AppEventManager } from "./AppEventManager";
import { MatchMaker } from "./MatchMaker";
import { WorkerManager } from "./WorkerManager";
import { Server } from "./Server";

declare global {
    var eventManager: AppEventManager;
}

global.eventManager = new AppEventManager();

const matchmaker = new MatchMaker();
const workermanager = new WorkerManager();

const server = new Server();
