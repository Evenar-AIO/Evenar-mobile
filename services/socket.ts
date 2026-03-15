import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

let socket: Socket | null = null;

export async function connectSocket(): Promise<Socket> {
  if (socket?.connected) return socket;

  const token = await AsyncStorage.getItem("auth_token");
  if (!token) throw new Error("No auth token");

  socket = io(BASE_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  return new Promise((resolve, reject) => {
    socket!.on("connect", () => resolve(socket!));
    socket!.on("connect_error", (err) => reject(err));
  });
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}

export function joinUserRoom(userId: number) {
  socket?.emit("join_user_room", userId);
}

export function leaveUserRoom(userId: number) {
  socket?.emit("leave_user_room", userId);
}

export function joinConversation(conversationId: number) {
  socket?.emit("join_conversation", conversationId);
}

export function leaveConversation(conversationId: number) {
  socket?.emit("leave_conversation", conversationId);
}

export function emitTyping(conversationId: number, isTyping: boolean) {
  socket?.emit("typing", { conversationId, isTyping });
}
