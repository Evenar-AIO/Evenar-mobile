import { apiRequest, BASE_URL } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Conversation, Message, SendMessagePayload } from '../types';

export interface ChatUser {
  legacyId: number;
  username: string;
  email: string;
  role: 'admin' | 'event_owner' | 'customer';
  avatar: string | null;
}

export async function getUsers(): Promise<ChatUser[]> {
  const res = await apiRequest<{ success: boolean; data: ChatUser[] }>('/auth/dev-users');
  return res.data ?? [];
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export async function getConversations(page = 1): Promise<PaginatedResponse<Conversation>> {
  return apiRequest(`/chat/conversations?page=${page}&limit=20`);
}

export async function markConversationRead(conversationId: number): Promise<void> {
  await apiRequest(`/chat/conversations/${conversationId}/read`, { method: 'PATCH' });
}

export async function getMessages(
  conversationId: number,
  page = 1
): Promise<PaginatedResponse<Message> & { conversation: Conversation }> {
  return apiRequest(`/chat/conversations/${conversationId}/messages?page=${page}&limit=30`);
}

export async function sendTextMessage(payload: SendMessagePayload): Promise<{ success: boolean; data: Message }> {
  return apiRequest('/chat/send', {
    method: 'POST',
    body: payload as Record<string, unknown>,
  });
}

export async function sendMessageWithFiles(
  payload: SendMessagePayload,
  files: Array<{ uri: string; name: string; mimeType: string }>
): Promise<{ success: boolean; data: Message }> {
  const token = await AsyncStorage.getItem('auth_token');
  const formData = new FormData();

  if (payload.conversationId) formData.append('conversationId', String(payload.conversationId));
  if (payload.eventId) formData.append('eventId', String(payload.eventId));
  if (payload.recipientId) formData.append('recipientId', String(payload.recipientId));
  if (payload.subject) formData.append('subject', payload.subject);
  if (payload.messageContent) formData.append('messageContent', payload.messageContent);

  files.forEach((file) => {
    formData.append('files', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType,
    } as unknown as Blob);
  });

  const res = await fetch(`${BASE_URL}/chat/send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
  return json;
}
