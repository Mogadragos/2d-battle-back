import { Socket } from "socket.io";
import { WorkerManager } from "./WorkerManager";

export class MatchMaker {
    pendingRooms: Set<string>;
    workermanager: WorkerManager;

    constructor(workermanager: WorkerManager) {
        this.pendingRooms = new Set<string>();
        this.workermanager = workermanager;
    }

    findGame(socket: Socket) {
        console.log("trying to find game");
        const [firstPendingRoom] = this.pendingRooms;
        if (firstPendingRoom) {
            this.joinRoom(socket, firstPendingRoom);
        } else {
            this.createRoom(socket);
        }
    }

    joinRoom(socket: Socket, room: string) {
        socket.join(room);
        this.pendingRooms.delete(room);

        console.log("join room " + room);

        this.workermanager.createWorker(room);
    }

    createRoom(socket: Socket) {
        const newPendingRoom = this.createRoomName(socket.id);
        this.pendingRooms.add(newPendingRoom);
        socket.join(newPendingRoom);

        console.log("create room " + newPendingRoom);
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
