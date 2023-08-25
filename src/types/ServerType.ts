import { Server } from "socket.io";
import { Socket } from "~shared/shared-types";

export type ServerType = Server<
    Socket.ClientToServerEvents,
    Socket.ServerToClientEvents,
    Socket.InterServerEvents,
    Socket.SocketData
>;
