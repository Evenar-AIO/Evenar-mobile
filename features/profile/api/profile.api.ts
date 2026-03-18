import api from '../../../services/api';
import {
  CustomerProfilePayload,
  OwnerProfilePayload,
  ProfileResponse,
} from '../types/profile.type';

export const updateCustomerProfile = async (
  payload: CustomerProfilePayload
): Promise<ProfileResponse> => {
  const response = await api.post('/profile/update', payload);
  return response.data;
};

export const updateOwnerProfile = async (
  payload: OwnerProfilePayload
): Promise<ProfileResponse> => {
  const response = await api.post('/owner/profile/update', payload);
  return response.data;
};