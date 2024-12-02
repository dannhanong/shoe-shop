import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile, isAuthenticated } from '../services/auth.service';

interface ProfileContextType {
    profile: {
        name: string;
        phoneNumber: string;
        avatarUrl: string;
    };
    setProfile: React.Dispatch<React.SetStateAction<{
        name: string;
        phoneNumber: string;
        avatarUrl: string;
    }>>;
    reloadProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};

interface ProfileProviderProps {
    children: React.ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
    const [profile, setProfile] = useState({
        name: '',
        phoneNumber: '',
        avatarUrl: ''
    });

    const reloadProfile = async () => {
        if (isAuthenticated()) {
            await getProfile()
            .then(data => {
                const { name, phoneNumber, avatarCode } = data;
                const avatarUrl = avatarCode ? `${process.env.REACT_APP_BASE_URL}/files/preview/${avatarCode}` : '/default-avatar.png';
                setProfile({ name, phoneNumber, avatarUrl });
            })
            .catch(error => {
                console.error('Lỗi khi tải thông tin người dùng:', error);
            });
        }
    };

    useEffect(() => {
        reloadProfile();
    }, []);

    return (
        <ProfileContext.Provider value={{ profile, setProfile, reloadProfile }}>
            {children}
        </ProfileContext.Provider>
    );
};