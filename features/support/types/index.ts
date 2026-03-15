export type SupportStatus = 'pending' | 'in_progress' | 'resolved';
export type SupportPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SupportAttachment {
  _id: string;
  legacyId: number;
  supportId: number;
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadTimestamp: string;
}

export interface SupportTicket {
  _id: string;
  legacyId: number;
  userId: number;
  fromEmail: string;
  subject: string;
  content: string;
  status: SupportStatus;
  priority: SupportPriority;
  category: string;
  sendTimestamp: string;
  adminResponse: string | null;
  eventId: number | null;
  orderId: number | null;
  attachments?: SupportAttachment[];
}

export interface CreateSupportPayload {
  subject: string;
  content: string;
  category: string;
  priority?: SupportPriority;
  eventId?: number;
  orderId?: number;
}
