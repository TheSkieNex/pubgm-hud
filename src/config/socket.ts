import { Server as HttpServer } from 'http';

import { Server } from 'socket.io';

let io: Server;

export function initSocket(server: HttpServer) {
  io = new Server(server);
}

export function getSocket() {
  return io;
}
