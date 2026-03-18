import { Alert } from 'react-native';
import { useProfileStore } from '../../../store/profile.store';
import { validateProfileForm } from '../validation/profile.validation';
import {
  ProfileFormValues,
  UserRole,
  CustomerProfilePayload,
  OwnerProfilePayload,
} from '../types/profile.type';

export const useProfileSubmit = () => {
  const {
    loading,
    error,
    successMessage,
    updateCustomer,
    updateOwner,
    clearProfileState,
  } = useProfileStore();

  const submitProfile = async (
    role: UserRole,
    values: ProfileFormValues
  ): Promise<boolean> => {
    clearProfileState();

    const validationError = validateProfileForm(values);
    if (Object.keys(validationError).length > 0) {
      const message = Object.values(validationError).filter(Boolean).join('\n');
      Alert.alert('Validation error', message);
      return false;
    }

    try {
      if (role === 'event_owner') {
        const ownerPayload: OwnerProfilePayload = {
          fullName: values.fullName,
          phone: values.phone,
          avatar: values.avatar,
          dateOfBirth: values.dateOfBirth,
          gender: values.gender,
          address: values.address,
          bio: values.bio,
          organizationName: values.organizationName,
        };

        await updateOwner(ownerPayload);
      } else {
        const customerPayload: CustomerProfilePayload = {
          fullName: values.fullName,
          phone: values.phone,
          avatar: values.avatar,
          dateOfBirth: values.dateOfBirth,
          gender: values.gender,
          address: values.address,
          bio: values.bio,
        };

        await updateCustomer(customerPayload);
      }

      Alert.alert('Success', 'Profile updated successfully');
      return true;
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.response?.data?.message || err?.message || 'Update profile failed'
      );
      return false;
    }
  };

  return {
    loading,
    error,
    successMessage,
    submitProfile,
    clearProfileState,
  };
};