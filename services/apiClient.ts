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

const DEFAULT_LAN_IP = '192.168.1.3';
const RAW_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  process.env.EXPO_PUBLIC_API_URL ??
  `http://${DEFAULT_LAN_IP}:5000`;
const API_BASE_URL = RAW_API_BASE_URL
  .replace('localhost', DEFAULT_LAN_IP)
  .replace('127.0.0.1', DEFAULT_LAN_IP);

if (!process.env.EXPO_PUBLIC_API_BASE_URL && !process.env.EXPO_PUBLIC_API_URL) {
  console.warn(
    `API base URL not set. Falling back to http://${DEFAULT_LAN_IP}:5000. Update .env to change this.`
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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(headers ?? {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

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
