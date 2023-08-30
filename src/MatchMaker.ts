import { AppSocket } from "./types/SocketTypes";

export class MatchMaker {
    pendingRooms: Map<string, AppSocket>;

    constructor() {
        this.pendingRooms = new Map();

        global.eventManager.addEventListener(
            "disconnecting",
            (socket: AppSocket) => {
                this.removePendingGame(socket.id);
            }
        );

        global.eventManager.addEventListener(
            "findGame",
            (socket: AppSocket) => {
                this.findGame(socket);
            }
        );
    }

    findGame(socket: AppSocket) {
        const [firstPendingRoom] = this.pendingRooms;
        if (firstPendingRoom) {
            this.joinRoom(...firstPendingRoom, socket);
        } else {
            this.createRoom(socket);
        }
    }

    joinRoom(room: string, socketA: AppSocket, socketB: AppSocket) {
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

    createRoom(socket: AppSocket) {
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
