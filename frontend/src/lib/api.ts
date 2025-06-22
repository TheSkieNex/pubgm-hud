import { io } from 'socket.io-client';

export const API_BASE_URL = 'http://localhost:3011';

export const socket = io('ws://localhost:3011', {
  withCredentials: true,
  transports: ['websocket'],
});
