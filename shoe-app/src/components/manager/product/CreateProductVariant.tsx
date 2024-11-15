import React, { useState, useEffect, ChangeEvent } from 'react';
import { Box, Button, Card, MenuItem, Select, TextField, Typography, FormControl, InputLabel, Input, Avatar, IconButton, Grid } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import { Brand } from '../../../models/Brand';
import { Category } from '../../../models/Category';
import { getAllBrands } from '../../../services/brand.service';
import { getAllCategories } from '../../../services/category.service';
import { FaFileUpload, FaRegFileImage } from "react-icons/fa";

interface Variant {
    size: number;
    color: string;
    price: number;
    stockQuantity: number;
    defaultVariant: boolean;
    avatar: File | null;
    avatarPreview: string | null;
    relatedImages: File[];
    relatedImagesPreviews: string[];
}

const CreateProductWithVariants: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    const [selectedBrand, setSelectedBrand] = useState<number | ''>('');
    const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [sizes, setSizes] = useState<number[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
    const [colors, setColors] = useState<string[]>(['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF']);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [variants, setVariants] = useState<Variant[]>([]);

    useEffect(() => {
        fetchBrands();
        fetchCategories();
        setSizes(Array.from({ length: 21 }, (_, i) => i + 30)); // Tạo danh sách size từ 30 đến 50
    }, []);

    const fetchBrands = async () => {
        try {
            const response = await getAllBrands('', 0, 100, '', '');
            setBrands(response.data.content);
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await getAllCategories('', 0, 100, '', '');
            setCategories(response.data.content);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSizeChange = (size: number) => {
        if (selectedSizes.includes(size)) {
            setSelectedSizes(selectedSizes.filter(s => s !== size));
        } else {
            setSelectedSizes([...selectedSizes, size]);
        }
    };

    const handleColorChange = (color: string) => {
        if (selectedColors.includes(color)) {
            setSelectedColors(selectedColors.filter(c => c !== color));
        } else {
            setSelectedColors([...selectedColors, color]);
        }
    };

    const generateVariants = () => {
        const newVariants: Variant[] = [];
        selectedSizes.forEach(size => {
            selectedColors.forEach(color => {
                newVariants.push({
                    size,
                    color,
                    price: Number(price),
                    stockQuantity: 0,
                    defaultVariant: false,
                    avatar: null,
                    avatarPreview: null,
                    relatedImages: [],
                    relatedImagesPreviews: []
                });
            });
        });
        setVariants(newVariants);
    };

    const handleAvatarChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const updatedVariants = [...variants];
            updatedVariants[index].avatar = file;
            updatedVariants[index].avatarPreview = URL.createObjectURL(file);
            setVariants(updatedVariants);
        }
    };

    const handleRelatedImagesChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const updatedVariants = [...variants];
    
            // Kiểm tra nếu số lượng ảnh hiện tại dưới 6 mới thêm ảnh
            if (updatedVariants[index].relatedImages.length < 6) {
                updatedVariants[index].relatedImages.push(file);
                updatedVariants[index].relatedImagesPreviews.push(URL.createObjectURL(file));
                setVariants(updatedVariants);
            } else {
                toast.warning('Bạn chỉ có thể thêm tối đa 6 ảnh', {
                    autoClose: 3000,
                });
            }
        }
    };       

    const handleSubmit = () => {
        if (!name || !description || !price || !selectedBrand || selectedSizes.length === 0 || selectedColors.length === 0) {
            toast.error('Vui lòng nhập đầy đủ thông tin sản phẩm và chọn size, màu', { autoClose: 3000 });
            return;
        }

        generateVariants();
    };

    return (
        <Card sx={{ maxWidth: 800, margin: 'auto', padding: 3, marginTop: 5 }}>
            <Typography variant="h5" sx={{ marginBottom: 2 }}>Tạo sản phẩm mới và biến thể</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
                <TextField label="Tên sản phẩm" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
                <TextField label="Mô tả sản phẩm" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={4} required />
                <TextField label="Giá" type="number" value={price} onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')} fullWidth required />

                <FormControl fullWidth>
                    <InputLabel id="brand-select-label">Thương hiệu</InputLabel>
                    <Select labelId="brand-select-label" value={selectedBrand} onChange={(e) => setSelectedBrand(Number(e.target.value))} label="Thương hiệu" required>
                        {brands.map((brand) => (
                            <MenuItem key={brand.id} value={brand.id}>{brand.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel id="category-select-label">Thể loại</InputLabel>
                    <Select labelId="category-select-label" value={selectedCategory} onChange={(e) => setSelectedCategory(Number(e.target.value))} label="Thể loại">
                        <MenuItem value="">Không có</MenuItem>
                        {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Chọn size */}
                <Box>
                    <Typography variant="subtitle1">Chọn size</Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                        {sizes.map(size => (
                            <Button key={size} variant={selectedSizes.includes(size) ? 'contained' : 'outlined'} onClick={() => handleSizeChange(size)}>
                                {size}
                            </Button>
                        ))}
                    </Box>
                </Box>

                {/* Chọn màu */}
                <Card sx={{ maxWidth: 800, margin: 'auto', padding: 3, marginTop: 5 }}>
                    <Typography variant="h5" sx={{ marginBottom: 2 }}>Chọn màu sắc</Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                        {colors.map(color => (
                            <Button
                                key={color}
                                variant={selectedColors.includes(color) ? 'contained' : 'outlined'}
                                sx={{
                                    backgroundColor: color,
                                    color: color === '#FFFFFF' ? 'black' : 'white',
                                    border: `1px solid ${color === '#FFFFFF' ? 'black' : color}`,
                                    minWidth: 40,
                                    minHeight: 40
                                }}
                                onClick={() => handleColorChange(color)}
                            >
                                {selectedColors.includes(color) ? '✓' : ''}
                            </Button>
                        ))}
                    </Box>
                    {/* <Typography sx={{ marginTop: 2 }}>Màu đã chọn: {selectedColors.join(', ')}</Typography> */}
                </Card>

                <Button variant="contained" color="primary" onClick={handleSubmit}>Tạo danh sách biến thể</Button>

                {/* Hiển thị biến thể */}
                {variants.length > 0 && (
                    <Box>
                        <Typography variant="h6" sx={{ marginTop: 2 }}>Danh sách biến thể</Typography>
                        <Grid container spacing={2}>
                            {variants.map((variant, index) => (
                                <Grid item xs={12} md={6} lg={4} key={index}>
                                    <Card sx={{ padding: 2, border: '1px solid #ccc', borderRadius: 2 }}>
                                        <Typography>
                                            Size: {variant.size} - Màu:
                                            <Box
                                                component="span"
                                                sx={{
                                                    display: 'inline-block',
                                                    width: 20,
                                                    height: 20,
                                                    backgroundColor: variant.color,
                                                    marginLeft: 1,
                                                    border: '1px solid #000',
                                                }}
                                            />
                                        </Typography>
                                        <TextField label="Giá" type="number" value={variant.price} fullWidth margin="normal" />
                                        <TextField label="Số lượng" type="number" fullWidth margin="normal" />

                                        {/* Ảnh đại diện */}
                                        <Box>
                                            <Typography>Ảnh đại diện</Typography>
                                            <label
                                                htmlFor={`avatar-upload-${index}`}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 100,
                                                    height: 100,
                                                    borderRadius: '50%',
                                                    backgroundImage: `url(${variant.avatarPreview || '/dist/images/default_upload.png'})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    cursor: 'pointer',
                                                    border: '1px solid #ccc',
                                                }}
                                            >
                                                <input
                                                    type="file"
                                                    id={`avatar-upload-${index}`}
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => handleAvatarChange(index, e)}
                                                />
                                            </label>
                                        </Box>

                                        {/* Ảnh liên quan */}
                                        <Box>
                                            <Typography>Ảnh liên quan</Typography>
                                            <Box display="flex" alignItems="center" gap={1} marginTop={1}>
                                                <Box display="flex" gap={1} sx={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                                                    {variant.relatedImagesPreviews.map((preview, i) => (
                                                        <img
                                                            key={i}
                                                            src={preview}
                                                            alt={`Related ${i}`}
                                                            style={{ width: 50, height: 50, objectFit: 'cover', display: 'inline-block' }}
                                                        />
                                                    ))}
                                                </Box>
                                                {/* Ẩn nút tải lên nếu đã có đủ 6 ảnh */}
                                                {variant.relatedImagesPreviews.length < 6 && (
                                                    <IconButton color="secondary" component="label">
                                                        <FaRegFileImage color='green' />
                                                        <input type="file" hidden onChange={(e) => handleRelatedImagesChange(index, e)} />
                                                    </IconButton>
                                                )}
                                            </Box>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}
            </Box>
            <ToastContainer />
        </Card>
    );
};

export default CreateProductWithVariants;
