export interface FileAttachment {
  _id: string;
  legacyId: number;
  messageId: number;
  originalFilename: string;
  storedFilename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface Message {
  _id: string;
  legacyId: number;
  conversationId: number;
  senderId: number;
  messageContent: string;
  messageType: 'text' | 'image' | 'file';
  isRead: boolean;
  readAt: string | null;
  isEdited: boolean;
  editedAt: string | null;
  createdAt: string;
  updatedAt: string;
  attachments?: FileAttachment[];
}

export interface OtherUser {
  id: number;
  username: string;
  avatar: string | null;
}

export interface LastMessage {
  content: string;
  type: string;
  sentAt: string;
  senderId: number;
}

export interface Conversation {
  _id: string;
  legacyId: number;
  customerId: number;
  eventOwnerId: number;
  eventId: number | null;
  subject: string;
  status: 'active' | 'closed';
  lastMessageAt: string;
  createdBy: number;
  isDeletedByCustomer: boolean;
  isDeletedByOwner: boolean;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
  lastMessage?: LastMessage | null;
  otherUser?: OtherUser | null;
}

export interface SendMessagePayload {
  conversationId?: number;
  eventId?: number;
  recipientId?: number;
  subject?: string;
  messageContent?: string;
}
