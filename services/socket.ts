import { io, type Socket } from 'socket.io-client';
import { Platform } from 'react-native';

const DEFAULT_LAN_IP = '192.168.1.3';
const RAW_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  process.env.EXPO_PUBLIC_API_URL ??
  `http://${DEFAULT_LAN_IP}:3000/api`;

const SOCKET_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:3000' 
  : RAW_API_BASE_URL.replace('/api', '').replace('localhost', DEFAULT_LAN_IP);

export function createSocket({ token, userId }: { token: string; userId: string }) {
  console.log('[Socket] Connecting to:', SOCKET_BASE_URL);
  return io(SOCKET_BASE_URL, {
    auth: { token, userId },
    transports: ['websocket', 'polling']
  });
}

export type { Socket };
