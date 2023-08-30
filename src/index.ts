import "module-alias/register";

import { AppEventManager } from "./AppEventManager";
import { MatchMaker } from "./MatchMaker";
import { AppWorkerManager } from "./AppWorkerManager";
import { Server } from "./Server";

declare global {
    var eventManager: AppEventManager;
}

global.eventManager = new AppEventManager();

const matchmaker = new MatchMaker();
const workermanager = new AppWorkerManager();

const server = new Server();
