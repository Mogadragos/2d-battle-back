import "module-alias/register";

import { Server } from "socket.io";
import { ServerType } from "./types/ServerType";
import { MatchMaker } from "./MatchMaker";
import { WorkerManager } from "./WorkerManager";
import { AppEventManager } from "./AppEventManager";

declare global {
    var eventManager: AppEventManager;
}

global.eventManager = new AppEventManager();

const io: ServerType = new Server(3000, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

const matchmaker = new MatchMaker();
const workermanager = new WorkerManager();

io.on("connection", function (socket) {
    console.log("user connected");

    socket.on("disconnecting", (reason) => {
        console.log("user disconnecting");
        global.eventManager.dispatchEvent("disconnecting", socket);
    });

    if (socket.rooms.size < 2) {
        matchmaker.findGame(socket);
    }
});

global.eventManager.addEventListener("workerStopped", (room: string) => {
    io.to(room).emit("close");
});

console.log("Server Started !");
