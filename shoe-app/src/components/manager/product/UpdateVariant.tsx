import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    TextField,
    Typography,
    IconButton,
    Dialog,
    DialogContent,
    DialogActions,
    DialogTitle,
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
    const [colors, setColors] = useState<string[]>([
        '#FFFFFF', // Trắng
        '#000000', // Đen
        '#FF0000', // Đỏ
        '#00FF00', // Xanh lá
        '#0000FF', // Xanh dương
        '#808080', // Xám
        '#FFD700', // Vàng
        '#8B4513', // Nâu (da)
        '#C0C0C0', // Bạc
        '#FF69B4'  // Hồng nhạt
    ]);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [newColor, setNewColor] = useState<string>('');

    const handleColorChange = (color: string) => {
        setSelectedColor(color);
        if (variant) {
            setVariant({ ...variant, color });
        }
    }

    const handleAddColor = () => {
        if (/^#[0-9A-F]{6}$/i.test(newColor)) {
            setColors(prevColors => [...prevColors, newColor]);
            setNewColor('');
            setOpenDialog(false);
        } else {
            alert('Mã màu không hợp lệ!');
        }
    };

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

            setColorPreview(data.color);
            setSelectedColor(data.color);
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
            <Typography variant="h5">Cập nhật biến thể</Typography>
            <Box display="flex" flexDirection="column" gap={2} marginTop={3}>
                <TextField
                    label="Size"
                    type="number"
                    value={variant.size}
                    onChange={(e) => setVariant({ ...variant, size: Number(e.target.value) })}
                    fullWidth
                />
                {/* <TextField
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
                ></Box> */}
                <Box display="flex" justifyContent={'center'} flexWrap="wrap" gap={1}>
                    {colors.map(color => (
                        <Button
                            key={color}
                            sx={{
                                backgroundColor: color,
                                color: color === '#FFFFFF' ? 'black' : 'white',
                                border: `1px solid ${color === '#FFFFFF' ? 'black' : color}`,
                                minWidth: 40,
                                minHeight: 40
                            }}
                            onClick={() => handleColorChange(color)}
                        >
                            { color === selectedColor ? '✓' : ''}
                        </Button>
                    ))}
                    <Button
                        variant={'outlined'}
                        sx={{
                            backgroundColor: 'white',
                            color: 'blue',
                            border: `1px solid 'blue`,
                            minWidth: 40,
                            minHeight: 40,
                        }}
                        onClick={() => setOpenDialog(true)}
                    >
                        +
                    </Button>
                </Box>
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

            {/* Dialog để thêm màu mới */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Thêm Mã Màu Mới</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Mã Màu (Hex)"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        fullWidth
                        autoFocus
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">
                        Hủy
                    </Button>
                    <Button onClick={handleAddColor} color="primary">
                        Thêm
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default UpdateVariant;