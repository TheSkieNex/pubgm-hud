import { io } from 'socket.io-client';

const ENV = import.meta.env;

const isProduction = ENV.VITE_ENV === 'production';

export const API_BASE_URL = ENV.VITE_API_BASE_URL || 'http://localhost:3011';
export const API_URL = isProduction ? `${API_BASE_URL}/api` : API_BASE_URL;
export const API_ROUTER_URL = `${API_URL}/router`;

export const socket = io(API_BASE_URL, {
  path: '/socket.io',
  withCredentials: true,
  transports: ['websocket'],
});
