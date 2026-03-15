import { apiRequest } from "@/services/api";
import type { Feedback, FeedbackStats, CreateFeedbackPayload } from "../types";

interface FeedbackListResponse {
  success: boolean;
  data: Feedback[];
  stats: FeedbackStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getFeedbackByEvent(
  eventId: number,
  page = 1,
): Promise<FeedbackListResponse> {
  return apiRequest(`/feedback/${eventId}?page=${page}&limit=10`);
}

export async function createFeedback(
  payload: CreateFeedbackPayload,
): Promise<{ success: boolean; data: Feedback }> {
  return apiRequest("/feedback", {
    method: "POST",
    body: payload as unknown as Record<string, unknown>,
  });
}
