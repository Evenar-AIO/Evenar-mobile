import { ProfileFormValues } from '../types/profile.type';

export interface ProfileFormErrors {
    fullName?: string;
    phone?: string;
}

export const validateProfileForm = (values: ProfileFormValues): ProfileFormErrors => {
    const errors: ProfileFormErrors = {};

    if (!values.fullName.trim()) {
        errors.fullName = 'Họ và tên không được để trống';
    }

    if (values.phone && !/^(0|\+84)[0-9]{9,10}$/.test(values.phone.trim())) {
        errors.phone = 'Số điện thoại không hợp lệ';
    }

    return errors;
};