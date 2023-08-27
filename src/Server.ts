import { Server as ServerIO, Socket as SocketIO } from "socket.io";
import { Socket } from "./shared-types";

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

            socket.on("ready", () =>
                global.eventManager.dispatchEvent("socketReady", socket)
            );

            socket.on("spawn", () => {
                console.log("Spawn soldier");
            });

            if (socket.rooms.size < 2) {
                global.eventManager.dispatchEvent("findGame", socket);
            }
        });

        global.eventManager.addEventListener(
            "workerStopped",
            (room: string) => {
                this.to(room).emit("close");
            }
        );

        global.eventManager.addEventListener(
            "workerReady",
            (event: { socketA: SocketIO; socketB: SocketIO }) => {
                event.socketA.emit("ready", true);
                event.socketB.emit("ready", false);
            }
        );

        global.eventManager.addEventListener("launch", (room: string) => {
            console.log("launch game");
            this.to(room).emit("launch");
        });
    }
}
