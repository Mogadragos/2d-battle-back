import { Socket } from "socket.io";
import { WorkerManager } from "./WorkerManager";

export class MatchMaker {
    pendingRooms: Map<string, Socket>;

    constructor() {
        this.pendingRooms = new Map();

        global.eventManager.addEventListener(
            "disconnecting",
            (socket: Socket) => {
                this.removePendingGame(socket.id);
            }
        );

        global.eventManager.addEventListener("findGame", (socket: Socket) => {
            this.findGame(socket);
        });
    }

    findGame(socket: Socket) {
        const [firstPendingRoom] = this.pendingRooms;
        if (firstPendingRoom) {
            this.joinRoom(...firstPendingRoom, socket);
        } else {
            this.createRoom(socket);
        }
    }

    joinRoom(room: string, socketA: Socket, socketB: Socket) {
        this.pendingRooms.delete(room);

        socketA.join(room);
        socketB.join(room);

        console.log("join room " + room);

        global.eventManager.dispatchEvent("roomReady", {
            room,
            socketA,
            socketB,
        });
    }

    createRoom(socket: Socket) {
        const newPendingRoom = this.createRoomName(socket.id);
        this.pendingRooms.set(newPendingRoom, socket);
        console.log("create pending room " + newPendingRoom);
    }

    removePendingGame(socketId: string) {
        const roomName = this.createRoomName(socketId);
        const deleted = this.pendingRooms.delete(roomName);

        if (deleted) console.log("delete pending room " + roomName);
    }

    // Utils

    createRoomName(socketId: string) {
        return `${socketId}_game`;
    }
}
