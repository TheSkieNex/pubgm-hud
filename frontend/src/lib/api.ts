import { io } from 'socket.io-client';

const ENV = import.meta.env;

export const API_BASE_URL = ENV.VITE_API_BASE_URL || 'http://localhost:3011';

export const socket = io(API_BASE_URL, {
  withCredentials: true,
  transports: ['websocket'],
});
