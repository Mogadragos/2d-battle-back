import { Server } from "socket.io";
import { ServerType } from "./types/ServerType";
import { MatchMaker } from "./MatchMaker";
import { WorkerManager } from "./WorkerManager";

const io: ServerType = new Server(3000, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

const workermanager = new WorkerManager(io);
const matchmaker = new MatchMaker(workermanager);

io.on("connection", function (socket) {
    console.log("user connected");

    socket.on("disconnecting", (reason) => {
        matchmaker.removePendingGame(socket.id);

        for (const room of socket.rooms) {
            if (room !== socket.id) {
                workermanager.terminateWorker(room);
            }
        }

        console.log("user disconnected");
    });

    if (socket.rooms.size < 2) {
        matchmaker.findGame(socket);
    }
});

console.log("Server Started !");
console.log(__dirname);
