export interface UserProfile {
  _id?: string;
  username?: string;
  email?: string;
  role?: 'customer' | 'event_owner' | 'admin';
  gender?: string;
  birthday?: string;
  phoneNumber?: string;
  address?: string;
  avatar?: string;
}
export type UserRole = 'customer' | 'event_owner';

export type ProfileFormValues = {
  fullName: string;
  phone: string;
  avatar: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  bio: string;
  organizationName: string;
};

export type CustomerProfilePayload = {
  fullName: string;
  phone: string;
  avatar: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  bio: string;
};

export type OwnerProfilePayload = {
  fullName: string;
  phone: string;
  avatar: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  bio: string;
  organizationName: string;
};

export type ProfileResponse = {
  success?: boolean;
  message?: string;
  data?: any;
};