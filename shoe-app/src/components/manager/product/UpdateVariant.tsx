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
import { addAvaterImage, addOtherImage, deleteOtherImage, getAllVariantByColor, getVariantById, updateVariantApi } from '../../../services/product.service';
import { toast, ToastContainer } from 'react-toastify';
import { Product } from '../../../models/Product';

const BASE_URL = process.env.REACT_APP_BASE_URL;

interface Variant {
    id: number;
    product: Product;
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
    const [sizes, setSizes] = useState<number[]>([]);
    const [selectedSize, setSelectedSize] = useState<number | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [newColor, setNewColor] = useState<string>('');
    const [listSizeUnavailable, setListSizeUnavailable] = useState<number[]>([]);
    const [currentSize, setCurrentSize] = useState<number | null>(null);
    const [currentColor, setCurrentColor] = useState<string | null>(null);

    const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!variant) return;

        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setVariant({
                ...variant,
                avatarPreview: reader.result as string,
            });
        };
        reader.readAsDataURL(file);

        try {
            const response = await addAvaterImage(Number(id), file);
            if (response) {
                toast.success('Cập nhật ảnh hiển thị thành công', {
                    autoClose: 3000,
                });
                fetchVariant();
            }
        } catch (error) {
            console.error('Error updating avatar:', error);
            toast.error('Không thể cập nhật ảnh hiển thị', {
                autoClose: 3000,
            });
        }
    };

    const handleRemoveImage = async (index: number) => {
        if (!variant) return;

        try {
            const response = await deleteOtherImage(Number(id), variant.imageOthers[index]);
            if (response) {
                fetchVariant();
            } else {
                toast.error('Không thể xóa ảnh', {
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            toast.error('Không thể xóa ảnh', {
                autoClose: 3000,
            });
        }
    };

    const handleAddOtherImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!variant) return;

        const files = e.target.files;
        if (!files) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        try {
            const response = await addOtherImage(Number(id), files[0]);
            if (response) {
                fetchVariant();
            } else {
                toast.error('Không thể thêm ảnh', {
                    autoClose: 3000,
                });
            }
        } catch (error) {
            toast.error('Không thể thêm ảnh', {
                autoClose: 3000,
            });
        }
    };

    const handleColorChange = async (color: string) => {
        setSelectedSize(null);
        setSelectedColor(color);
        setListSizeUnavailable([]);
        if (variant) {
            setVariant({ ...variant, color });
        }
        const response = await getAllVariantByColor(color, Number(variant?.product.id));
        response.data.map((v: Variant) => {
            setListSizeUnavailable((prev: number[]) => [...prev, v.size]);
        });
    }

    const handleSizeChange = (size: number) => {
        setSelectedSize(size);
        if (variant) {
            setVariant({ ...variant, size });
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
            setSelectedSize(data.size);
            setCurrentSize(data.size);
            setCurrentColor(data.color);

            const res = await getAllVariantByColor(data.color, Number(data.product.id));
            res.data.map((v: Variant) => {
                setListSizeUnavailable((prev: number[]) => [...prev, v.size]);
            });
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
        setSizes(Array.from({ length: 14 }, (_, i) => i + 34));
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
                <Box display="flex" justifyContent={'space-between'} alignItems={'center'} flexWrap="wrap" gap={1}>
                    <Typography sx={{ textAlign: 'left' }}>Màu sắc:</Typography>
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
                <Box display="flex" justifyContent={'space-between'} alignItems={'center'} flexWrap="wrap" gap={1}>
                    <Typography variant="subtitle1">Kích cỡ:</Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                        {sizes.map(size => (
                            <Button 
                                key={size} variant={(selectedSize === size) ? 'contained' : 'outlined'} onClick={() => handleSizeChange(size)}
                                disabled={listSizeUnavailable.includes(size)}
                            >
                                {size}
                            </Button>
                        ))}
                    </Box>
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

                <Box sx={{ minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', marginY: 2 }}>
                    <Typography sx={{ marginRight: 3 }}>Ảnh hiển thị: </Typography>
                    <label
                        htmlFor={`avatar-upload-${colorPreview}`}
                        style={{
                            display: 'inline-block',
                            width: 100,
                            height: 100,
                            // borderRadius: '50%',
                            backgroundImage: `url(${
                                variant?.avatarPreview || '/dist/images/default_upload.png'
                            })`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            cursor: 'pointer',
                            border: '1px solid #ccc',
                        }}
                    >
                        <input
                            type="file"
                            id={`avatar-upload-${colorPreview}`}
                            style={{ display: 'none' }}
                            onChange={(e) => handleAvatar(e)}
                        />
                    </label>
                </Box>

                <Box sx={{ minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography>Ảnh liên quan:</Typography>
                    <Box display="flex" alignItems="center" gap={1} marginTop={2}>
                        <Box display="flex" gap={1} sx={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                            {variant.relatedImagesPreviews?.map((preview, i) => (
                                <Box key={i} position="relative">
                                    <img
                                        src={preview}
                                        alt={`Related ${i}`}
                                        style={{
                                            width: 90,
                                            height: 90,
                                            objectFit: 'cover',
                                            display: 'inline-block',
                                        }}
                                    />

                                    <IconButton
                                        color="error"
                                        sx={{
                                            position: 'absolute',
                                            top: -25,
                                            right: -12,
                                        }}
                                        onClick={() => handleRemoveImage(i)}
                                    >
                                        &times;
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                        {/* Ẩn nút tải lên nếu đã có đủ 5 ảnh */}
                        {variant.imageOthers.length < 5 && (
                            <IconButton color="secondary" component="label">
                                <FaRegFileImage color="blue" />
                                <input
                                    type="file"
                                    hidden
                                    multiple
                                    onChange={(e) => handleAddOtherImage(e)}
                                />
                            </IconButton>
                        )}
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
                <Button 
                    variant="contained" color="primary" onClick={handleSave}
                    disabled={selectedSize === null || selectedColor === null || variant.stockQuantity < 0 || variant.price < 0 || (currentColor === selectedColor && currentSize === selectedSize)}
                >
                    Lưu thay đổi
                </Button>
            </Box>

            {/* Dialog để thêm màu mới */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Thêm Mã Màu Mới</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Mã Màu (Hex: #FFD700)"
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