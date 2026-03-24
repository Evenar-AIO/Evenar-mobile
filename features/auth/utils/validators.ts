import type { UserRole } from '@/features/auth/types/authTypes';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string) {
  if (!email.trim()) return 'Email là bắt buộc';
  if (!EMAIL_REGEX.test(email)) return 'Email không hợp lệ';
  return null;
}

export function validatePassword(password: string) {
  if (!password) return 'Mật khẩu là bắt buộc';
  return null;
}

export function validateFullName(fullName: string) {
  const trimmed = fullName.trim();
  if (!trimmed) return 'Họ tên là bắt buộc';
  if (trimmed.length < 2) return 'Họ tên phải có ít nhất 2 ký tự';
  if (!/^[\p{L}\p{N} ]+$/u.test(trimmed)) return 'Họ tên chỉ gồm chữ, số và khoảng trắng';
  return null;
}

export function validateConfirmPassword(password: string, confirmPassword: string) {
  if (!confirmPassword) return 'Vui lòng xác nhận mật khẩu';
  if (password !== confirmPassword) return 'Mật khẩu xác nhận không khớp';
  return null;
}

export function validateOtp(otp: string) {
  if (!otp) return 'OTP là bắt buộc';
  if (!/^\d{6}$/.test(otp)) return 'OTP phải gồm 6 chữ số';
  return null;
}

export function validateRole(role?: UserRole) {
  if (!role) return 'Vui lòng chọn vai trò';
  return null;
}

export function validateRequired(value: string, label: string) {
  if (!value.trim()) return `${label} là bắt buộc`;
  return null;
}
