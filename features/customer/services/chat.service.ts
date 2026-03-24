import { request } from '@/services/apiClient';

export const chatService = {
  createSupportConversation: (payload?: Record<string, unknown>) =>
    request('/chat/support', { method: 'POST', body: payload ?? {} }),
  createConversation: (payload: Record<string, unknown>) =>
    request('/chat/conversations', { method: 'POST', body: payload }),
  getConversations: () => request('/chat/conversations'),
  getMessages: (conversationId: string, before?: string) =>
    request(
      `/chat/conversations/${conversationId}/messages${before ? `?before=${before}` : ''}`
    ),
  sendMessage: (payload: Record<string, unknown>) =>
    request('/chat/send', { method: 'POST', body: payload }),
  deleteConversation: (conversationId: string) =>
    request(`/chat/conversations/${conversationId}`, { method: 'DELETE' }),
};
