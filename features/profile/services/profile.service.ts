import api from '@/services/api'; 
import { UserProfile } from '../types/profile.type'; 

export const getMyProfile = async (): Promise<UserProfile> => {
  const res = await api.get('/auth/me');
  return res.data?.data;
};

/**
 * Backend zip chưa có endpoint update profile.
 * Giữ sẵn để nối khi backend thêm.
 */
export const updateCustomerProfile = async (payload: Partial<UserProfile>) => {
  const res = await api.post('/profile/update', payload);
  return res.data;
};

/**
 * Backend zip chưa có endpoint update owner profile.
 */
export const updateOwnerProfile = async (payload: Partial<UserProfile>) => {
  const res = await api.post('/owner/profile/update', payload);
  return res.data;
};