import { Server as ServerIO } from "socket.io";
import { Socket } from "@shared/shared-types";
import { AppSocket } from "./types/SocketTypes";

export class Server extends ServerIO<
    Socket.ClientToServerEvents,
    Socket.ServerToClientEvents,
    Socket.InterServerEvents,
    Socket.SocketData
> {
    constructor() {
        super(3000, {
            cors: {
                origin: "http://localhost:5173",
                methods: ["GET", "POST"],
            },
        });

        this.init();

        console.log("Server Started !");
    }

    init() {
        this.on("connection", function (socket) {
            console.log("user connected");

            socket.on("disconnecting", (reason) => {
                console.log("user disconnecting");
                global.eventManager.dispatchEvent("disconnecting", socket);
            });

            if (socket.rooms.size < 2) {
                global.eventManager.dispatchEvent("findGame", socket);
            }
        });

        global.eventManager.addEventListener(
            "workerStopped",
            (room: string) => {
                this.in(room).disconnectSockets();
            }
        );

        global.eventManager.addEventListener(
            "workerReady",
            (event: { socketA: AppSocket; socketB: AppSocket }) => {
                event.socketA.emit("ready", true);
                event.socketB.emit("ready", false);
            }
        );
    }
}
