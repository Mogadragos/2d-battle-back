import { EventManager } from "@shared/game-utils/EventManager";

export class AppEventManager extends EventManager {
    constructor() {
        super();

        this.registerEvent("disconnecting");

        this.registerEvent("findGame");
        this.registerEvent("joinRoom");
        this.registerEvent("workerStopped");
    }
}
