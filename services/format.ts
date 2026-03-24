export function formatCurrency(value?: number) {
  if (!value) return '₫0';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

export function formatDate(value?: string) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('vi-VN');
}
