import { Platform } from 'react-native';
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

const DEFAULT_LAN_IP = '10.13.9.39';
const RAW_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  process.env.EXPO_PUBLIC_API_URL ??
  `http://${DEFAULT_LAN_IP}:3000/api`;

// Only rewrite localhost → LAN IP on native (device/emulator).
// On web, localhost is correct and reachable.
const API_BASE_URL = Platform.OS === 'web'
  ? RAW_API_BASE_URL
  : RAW_API_BASE_URL
      .replace('localhost', DEFAULT_LAN_IP)
      .replace('127.0.0.1', DEFAULT_LAN_IP);

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
    response = await fetch(url, {
      ...rest,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(headers ?? {}),
      },
      body: body ? JSON.stringify(body) : undefined,
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
