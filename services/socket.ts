import { io, type Socket } from 'socket.io-client';

const DEFAULT_LAN_IP = '192.168.1.3';
const RAW_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  process.env.EXPO_PUBLIC_API_URL ??
  `http://${DEFAULT_LAN_IP}:5000/api`;

const SOCKET_BASE_URL = RAW_API_BASE_URL.replace('/api', '').replace('localhost', DEFAULT_LAN_IP);

export function createSocket({ token, userId }: { token: string; userId: string }) {
  return io(SOCKET_BASE_URL, {
    auth: { token, userId },
  });
}

export type { Socket };
