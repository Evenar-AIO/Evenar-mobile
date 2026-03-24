import { Platform } from 'react-native';
import { request } from '@/services/apiClient';

export const profileService = {
  updateProfile: (payload: Record<string, any>) => 
    request('/profile/update', { method: 'POST', body: payload }),
    
  uploadImage: async (imageUri: string, fileName = 'avatar.jpg', type = 'image/jpeg') => {
    const formData = new FormData();
    
    // Web requires a real Blob/File, Native needs a Uri object
    if (Platform.OS === 'web') {
      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('file', blob, fileName);
      } catch (e) {
        console.error('Fetch blob failed', e);
        formData.append('file', { uri: imageUri, type, name: fileName } as any);
      }
    } else {
      formData.append('file', {
        uri: imageUri,
        type: type,
        name: fileName,
      } as any);
    }

    return request('/upload', {
      method: 'POST',
      body: formData as any,
    });
  },

  changePassword: (payload: Record<string, string>) =>
    request('/auth/change-password', { method: 'POST', body: payload }),
};
