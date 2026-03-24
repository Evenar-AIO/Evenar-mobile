import { ApiError } from '@/services/apiClient';

export function mapApiError(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Thông tin đăng nhập không chính xác';
    if (error.status === 403) return 'Bạn không có quyền thực hiện thao tác này';
    if (error.status === 409) return 'Dữ liệu đã tồn tại';
    if (error.status === 422) return error.message || 'Dữ liệu không hợp lệ';
    return error.message || fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
}
