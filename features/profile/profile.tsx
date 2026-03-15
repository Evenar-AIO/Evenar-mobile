import { ProfileFormValues, UserRole } from '../profile/types/profile.type';

export const validateProfileForm = (
  role: UserRole,
  values: ProfileFormValues
): string | null => {
  if (!values.fullName) return 'Full name is required';
  if (!values.phone) return 'Phone number is required';

  if (role === 'event_owner' && !values.organizationName) {
    return 'Organization name is required';
  }

  return null;
};