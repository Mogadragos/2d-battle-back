import { Socket as SocketIO } from "socket.io";
import { Socket } from "@shared/shared-types";

export type AppSocket = SocketIO<
    Socket.ClientToServerEvents,
    Socket.ServerToClientEvents,
    Socket.InterServerEvents,
    Socket.SocketData
>;
