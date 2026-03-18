import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ProfileForm from '@/features/profile/components/ProfileForm';

// Tạm mock để test UI.
// Khi merge thì thay bằng user thật từ auth store/context.
const mockCurrentUser = {
    role: 'customer' as 'customer' | 'event_owner',
    fullName: 'Nguyễn Văn A',
    phone: '0912345678',
    avatar: '',
    dateOfBirth: '2004-01-01',
    gender: 'Nam',
    address: 'Gia Lai',
    bio: '',
    organizationName: '',
};

export default function ProfileScreen() {
    const role = mockCurrentUser.role;

    return (
        <View style={styles.screen}>
            <Text style={styles.title}>
                {role === 'event_owner' ? 'Hồ sơ nhà tổ chức' : 'Hồ sơ cá nhân'}
            </Text>

            <ProfileForm
                role={role}
                initialValues={{
                    fullName: mockCurrentUser.fullName,
                    phone: mockCurrentUser.phone,
                    avatar: mockCurrentUser.avatar,
                    dateOfBirth: mockCurrentUser.dateOfBirth,
                    gender: mockCurrentUser.gender,
                    address: mockCurrentUser.address,
                    bio: mockCurrentUser.bio,
                    organizationName: mockCurrentUser.organizationName,
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        paddingHorizontal: 16,
        paddingTop: 16,
        color: '#0F172A',
    },
});