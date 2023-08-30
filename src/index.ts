import "module-alias/register";

import { AppEventManager } from "./AppEventManager";
import { MatchMaker } from "./MatchMaker";
import { GamesManager } from "./GamesManager";
import { Server } from "./Server";

declare global {
    var eventManager: AppEventManager;
}

global.eventManager = new AppEventManager();

const server = new Server();

const matchmaker = new MatchMaker();
const gamesmanager = new GamesManager(server);
