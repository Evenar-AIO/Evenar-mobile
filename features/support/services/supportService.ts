import { apiRequest, BASE_URL } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SupportTicket, CreateSupportPayload } from "../types";

interface SupportListResponse {
  success: boolean;
  data: SupportTicket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getSupportList(params?: {
  page?: number;
  status?: string;
  category?: string;
}): Promise<SupportListResponse> {
  const query = new URLSearchParams();
  query.set("page", String(params?.page ?? 1));
  query.set("limit", "20");
  if (params?.status) query.set("status", params.status);
  if (params?.category) query.set("category", params.category);

  return apiRequest(`/support/list?${query.toString()}`);
}

export async function submitSupport(
  payload: CreateSupportPayload,
  files?: Array<{ uri: string; name: string; mimeType: string }>,
): Promise<{ success: boolean; data: SupportTicket }> {
  if (!files || files.length === 0) {
    return apiRequest("/support/submit", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    });
  }

  const token = await AsyncStorage.getItem("auth_token");
  const formData = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined) formData.append(k, String(v));
  });
  files.forEach((file) => {
    formData.append("files", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType,
    } as unknown as Blob);
  });

  const res = await fetch(`${BASE_URL}/support/submit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
  return json;
}
