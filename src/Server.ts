import { Server as ServerIO } from "socket.io";
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
    }
}
