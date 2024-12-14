import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    TextField,
    Typography,
    IconButton,
} from '@mui/material';
import { FaRegFileImage } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';
import { getVariantById, updateVariantApi } from '../../../services/product.service';
import { toast, ToastContainer } from 'react-toastify';

const BASE_URL = process.env.REACT_APP_BASE_URL;

interface Variant {
    id: number;
    size: number;
    color: string;
    stockQuantity: number;
    price: number;
    defaultVariant: boolean;
    imageAvatar: string | null;
    imageOthers: string[];
    avatarPreview?: string | null;
    relatedImagesPreviews?: string[];
}

const UpdateVariant: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [variant, setVariant] = useState<Variant | null>(null);
    const [colorPreview, setColorPreview] = useState<string>(''); // Preview mã màu
    const [formattedPrice, setFormattedPrice] = useState<string>('');

    const fetchVariant = async () => {
        try {
            const response = await getVariantById(Number(id));
            const data = response.data;

            setVariant({
                ...data,
                avatarPreview: data.imageAvatar
                    ? `${BASE_URL}/files/preview/${data.imageAvatar}`
                    : null,
                relatedImagesPreviews: data.imageOthers.map(
                    (img: string) => `${BASE_URL}/files/preview/${img}`
                ),
            });

            setColorPreview(data.color); // Đặt preview màu ban đầu
        } catch (error) {
            console.error('Error fetching variant:', error);
        }
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/,/g, '');
        if (!isNaN(Number(value))) {
            setVariant(variant ? { ...variant, price: Number(value) } : variant);
            setFormattedPrice(Number(value).toLocaleString());
        } else if (value === '') {
            setFormattedPrice('');
        }
    }

    useEffect(() => {
        fetchVariant();
    }, [id]);

    const handleSave = async () => {
        if (!variant) return;

        Swal.fire({
            title: 'Xác nhận',
            text: 'Bạn có muốn lưu thay đổi không?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Lưu',
            cancelButtonText: 'Hủy',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await updateVariantApi(
                        Number(id),
                        variant.size,
                        variant.color,
                        variant.stockQuantity,
                        variant.price
                    );
                    if (response) {
                        toast.success('Cập nhật biến thể thành công', {
                            autoClose: 3000,
                        });
                        fetchVariant();
                    }
                } catch (error) {
                    console.error('Error updating variant:', error);
                    Swal.fire('Lỗi!', 'Không thể lưu thay đổi.', 'error');
                }
            }
        });
    };

    if (!variant) return <Typography>Đang tải...</Typography>;

    return (
        <Card sx={{ maxWidth: 800, margin: 'auto', padding: 3, marginTop: 5 }}>
            <Typography variant="h5">Cập nhật Biến Thể</Typography>
            <Box display="flex" flexDirection="column" gap={2} marginTop={3}>
                <TextField
                    label="Size"
                    type="number"
                    value={variant.size}
                    onChange={(e) => setVariant({ ...variant, size: Number(e.target.value) })}
                    fullWidth
                />
                <TextField
                    label="Màu sắc"
                    type="text"
                    value={variant.color}
                    onChange={(e) => {
                        const color = e.target.value;
                        setVariant({ ...variant, color });
                        setColorPreview(color); // Cập nhật preview màu sắc
                    }}
                    fullWidth
                />
                <Box
                    sx={{
                        width: 50,
                        height: 50,
                        backgroundColor: colorPreview, // Preview màu sắc
                        border: '1px solid #ccc',
                        marginTop: 2,
                        borderRadius: '4px',
                    }}
                ></Box>
                <TextField
                    label="Số lượng tồn kho"
                    type="number"
                    value={variant.stockQuantity}
                    onChange={(e) => setVariant({ ...variant, stockQuantity: Number(e.target.value) })}
                    fullWidth
                />
                <TextField
                    label="Giá"
                    type="text"
                    // value={variant.price}
                    // onChange={(e) => setVariant({ ...variant, price: Number(e.target.value) })}
                    value={formattedPrice || variant.price.toLocaleString()}
                    onChange={handlePriceChange}
                    fullWidth
                />

                <Box sx={{ marginTop: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Typography>Ảnh đại diện:</Typography>
                    <Box
                        sx={{
                            width: 100,
                            height: 100,
                            border: '1px solid #ccc',
                            backgroundImage: `url(${variant?.avatarPreview})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                </Box>

                <Box sx={{ marginTop: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Typography>Ảnh liên quan:</Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                        {variant?.relatedImagesPreviews?.map((preview, index) => (
                            <Box key={index} position="relative">
                                <img
                                    src={preview}
                                    alt={`Related ${index}`}
                                    style={{ width: 90, height: 90, objectFit: 'cover' }}
                                />
                            </Box>
                        ))}
                    </Box>
                </Box>
                <ToastContainer />
            </Box>
            <Box sx={{ marginTop: 3, display: 'flex', justifyContent: 'end' }}>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => window.history.back()}
                    sx={{ marginRight: 2 }}
                >
                    Quay lại
                </Button>
                <Button variant="contained" color="primary" onClick={handleSave}>
                    Lưu thay đổi
                </Button>
            </Box>
        </Card>
    );
};

export default UpdateVariant;