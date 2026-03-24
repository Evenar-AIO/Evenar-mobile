import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { ApiSuccessResponse } from '@/features/auth/types/authTypes';

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status = 500, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

// Dynamically determine the host's IP (for local dev)
const debuggerHost = Constants.expoConfig?.hostUri;
const DEFAULT_LAN_IP = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';

export const API_BASE_URL = Platform.OS === 'web'
  ? (process.env.EXPO_PUBLIC_API_BASE_URL ?? `http://localhost:3000/api`)
  : (process.env.EXPO_PUBLIC_API_BASE_URL ?? `http://${DEFAULT_LAN_IP}:3000/api`);

const RAW_API_BASE_URL = API_BASE_URL; // kept for compatibility with warnings below

if (!process.env.EXPO_PUBLIC_API_BASE_URL && !process.env.EXPO_PUBLIC_API_URL) {
  console.warn(
    `API base URL not set. Falling back to ${API_BASE_URL}. Update .env to change this.`
  );
}

if (RAW_API_BASE_URL !== API_BASE_URL) {
  console.warn(
    `API base URL (${RAW_API_BASE_URL}) uses localhost. Rewriting to ${API_BASE_URL} for device access.`
  );
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  console.log('[API Request]', rest.method ?? 'GET', url);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  let response: Response;
  try {
    const isFormData = body instanceof FormData || (body && typeof body === 'object' && body.constructor.name === 'FormData');
    let finalBody: BodyInit | undefined = undefined;
    const requestHeaders: Record<string, string> = {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(headers as Record<string, string> ?? {}),
    };

    if (body !== undefined) {
      if (isFormData || (body && typeof (body as any).append === 'function')) {
        finalBody = body as any;
        // CRITICAL: Must not have any Content-Type for FormData on any platform.
        // Let fetch calculate the multipart boundary.
        delete requestHeaders['Content-Type'];
        delete requestHeaders['content-type'];
      } else {
        requestHeaders['Content-Type'] = requestHeaders['Content-Type'] ?? 'application/json';
        finalBody = JSON.stringify(body);
      }
    }

    response = await fetch(url, {
      ...rest,
      signal: controller.signal,
      headers: requestHeaders,
      body: finalBody,
    });
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.', 0);
    }
    throw new ApiError(error.message ?? 'Network error', 0);
  } finally {
    clearTimeout(timeoutId);
  }

  const text = await response.text();
  let parsed: any = null;

  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      parsed?.message ?? 'Request failed. Please try again.',
      response.status,
      parsed?.errors ?? parsed,
    );
  }

  if (parsed && typeof parsed === 'object' && 'data' in parsed) {
    return (parsed as ApiSuccessResponse<T>).data;
  }

  return parsed as T;
}
