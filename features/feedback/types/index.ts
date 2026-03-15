export interface Feedback {
  _id: string;
  userId: number;
  eventId: number;
  orderId: number;
  rating: number;
  content: string;
  isApproved: boolean;
  adminResponse: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { username: string; avatar: string | null };
}

export interface FeedbackStats {
  avgRating: number;
  totalReviews: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface CreateFeedbackPayload {
  eventId: number;
  orderId: number;
  rating: number;
  content: string;
}
