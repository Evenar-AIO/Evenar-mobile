import { create } from 'zustand';
import {
    CustomerProfilePayload,
    OwnerProfilePayload,
    ProfileResponse,
} from '../features/profile/types/profile.type';
import {
    updateCustomerProfile,
    updateOwnerProfile,
} from '../features/profile/api/profile.api';

interface ProfileState {
    loading: boolean;
    error: string | null;
    successMessage: string | null;
    updateCustomer: (payload: CustomerProfilePayload) => Promise<ProfileResponse | null>;
    updateOwner: (payload: OwnerProfilePayload) => Promise<ProfileResponse | null>;
    clearProfileState: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
    loading: false,
    error: null,
    successMessage: null,

    updateCustomer: async (payload) => {
        try {
            set({ loading: true, error: null, successMessage: null });
            const result = await updateCustomerProfile(payload);
            set({
                loading: false,
                successMessage: result.message || 'Cập nhật hồ sơ thành công',
            });
            return result;
        } catch (error: any) {
            set({
                loading: false,
                error: error?.response?.data?.message || 'Cập nhật hồ sơ thất bại',
            });
            return null;
        }
    },

    updateOwner: async (payload) => {
        try {
            set({ loading: true, error: null, successMessage: null });
            const result = await updateOwnerProfile(payload);
            set({
                loading: false,
                successMessage: result.message || 'Cập nhật hồ sơ thành công',
            });
            return result;
        } catch (error: any) {
            set({
                loading: false,
                error: error?.response?.data?.message || 'Cập nhật hồ sơ thất bại',
            });
            return null;
        }
    },

    clearProfileState: () => {
        set({ loading: false, error: null, successMessage: null });
    },
}));