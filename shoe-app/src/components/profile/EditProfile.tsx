import React, { useState } from 'react';
import { Box, Button, Card, TextField, Typography, Avatar } from '@mui/material';
import { useProfile } from '../../contexts/ProfileContext';
import { updateProfile } from '../../services/profile.service';
import { toast, ToastContainer } from 'react-toastify';

const EditProfile: React.FC = () => {
    const { profile, setProfile, reloadProfile } = useProfile();
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setProfile({
            ...profile,
            [name]: value
        });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedFile(file);

            // Tạo URL để xem trước ảnh
            const fileUrl = URL.createObjectURL(file);
            setPreviewUrl(fileUrl);
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await updateProfile(profile.name, profile.phoneNumber, selectedFile);
            toast.success(response.message, {
                autoClose: 3000,
            });
            // Gọi reloadProfile để cập nhật dữ liệu profile
            reloadProfile();
        } catch (error) {
            toast.error('Cập nhật thất bại');
        }
    };

    return (
        <Card sx={{ maxWidth: 600, margin: 'auto', padding: 3, marginTop: 10 }}>
            <Typography variant="h5" sx={{ marginBottom: 2 }}>
                Chỉnh sửa thông tin cá nhân
            </Typography>
            <Box display="flex" flexDirection="row" gap={2}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Button variant="contained" component="label" sx={{ borderRadius: "100%", width: 100, height: 100 }}>
                        <Avatar
                            src={previewUrl || profile.avatarUrl || '/default-avatar.png'}
                            alt="Avatar"
                            sx={{ width: 100, height: 100 }}
                        />
                        <input type="file" hidden onChange={handleFileChange} />
                    </Button>
                </Box>
                <Box>
                    <TextField
                        label="Họ và tên"
                        name="name"
                        value={profile.name}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Số điện thoại"
                        name="phoneNumber"
                        value={profile.phoneNumber}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Lưu thay đổi
                    </Button>
                </Box>
            </Box>
            <ToastContainer />
        </Card>
    );
};

export default EditProfile;