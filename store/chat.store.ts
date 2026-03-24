import { create } from 'zustand';

import { chatService } from '@/features/customer/services/chat.service';
import { createSocket, type Socket } from '@/services/socket';

type Conversation = {
  _id: string;
  name?: string;
  lastMessage?: string;
  lastMessageAt?: string;
};

type Message = {
  _id: string;
  text?: string;
  senderId?: string;
  conversationId?: string;
  createdAt?: string;
};

type ChatState = {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  loading: boolean;
  socket: Socket | null;
  connectSocket: (token: string, userId: string) => void;
  disconnectSocket: () => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (payload: Record<string, unknown>) => Promise<void>;
  handleIncomingMessage: (message: Message) => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  loading: false,
  socket: null,
  connectSocket: (token, userId) => {
    const socket = createSocket({ token, userId });
    socket.on('chat:newConversation', (conv: Conversation) => {
      set((state) => ({
        conversations: [conv, ...state.conversations.filter((c) => c._id !== conv._id)],
      }));
    });
    socket.on('chat:message', (message: Message) => {
      get().handleIncomingMessage(message);
    });
    set({ socket });
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) socket.disconnect();
    set({ socket: null });
  },
  fetchConversations: async () => {
    set({ loading: true });
    try {
      const data: any = await chatService.getConversations();
      set({ conversations: data?.data ?? data ?? [] });
    } finally {
      set({ loading: false });
    }
  },
  fetchMessages: async (conversationId) => {
    set({ loading: true });
    try {
      const data: any = await chatService.getMessages(conversationId);
      set({
        messages: {
          ...get().messages,
          [conversationId]: data?.data ?? data ?? [],
        },
      });
    } finally {
      set({ loading: false });
    }
  },
  sendMessage: async (payload) => {
    await chatService.sendMessage(payload);
  },
  handleIncomingMessage: (message) => {
    set((state) => {
      const conversationId = message.conversationId ?? '';
      const current = state.messages[conversationId] ?? [];
      if (!conversationId) return state;
      const exists = current.some((msg) => msg._id === message._id);
      const nextMessages = exists ? current : [...current, message];
      const conversations = state.conversations.map((conv) =>
        conv._id === conversationId
          ? { ...conv, lastMessage: message.text, lastMessageAt: message.createdAt }
          : conv
      );
      return {
        messages: { ...state.messages, [conversationId]: nextMessages },
        conversations,
      };
    });
  },
}));
