import React, { useState, useEffect } from 'react';
import { Box, Button, Card, MenuItem, Select, TextField, Typography, FormControl, InputLabel, IconButton, Grid, FormControlLabel, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import { Brand } from '../../../models/Brand';
import { Category } from '../../../models/Category';
import { getAllBrands } from '../../../services/brand.service';
import { getAllCategorieList } from '../../../services/category.service';
import Swal from 'sweetalert2';
import { createProduct } from '../../../services/product.service';
import VariantForm from './VariantForm';

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
    const [formattedPrice, setFormattedPrice] = useState<string>('');
    const [selectedBrand, setSelectedBrand] = useState<number | ''>('');
    const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
    const [selectedGender, setSelectedGender] = useState<string | ''>('');
    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [sizes, setSizes] = useState<number[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
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
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newColor, setNewColor] = useState('');
    const [variants, setVariants] = useState<Variant[]>([]);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/,/g, ''); // Loại bỏ dấu phẩy khi nhập
        if (!isNaN(Number(value))) {
          const numberValue = Number(value);
          setPrice(numberValue);
          setFormattedPrice(
            new Intl.NumberFormat('en-US').format(numberValue) // Định dạng dấu phẩy
          );
        } else if (value === '') {
          setPrice('');
          setFormattedPrice('');
        }
    };

    // Hàm mở dialog
    const handleOpenDialogAddColor = () => {
        setOpenDialog(true);
    };

    // Hàm đóng dialog
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    // Hàm thêm màu vào danh sách
    const handleAddColor = () => {
        if (/^#[0-9A-F]{6}$/i.test(newColor)) {
            setColors(prevColors => [...prevColors, newColor]);
            setNewColor('');
            handleCloseDialog();
        } else {
            alert('Mã màu không hợp lệ!');
        }
    };

    const handleCreateProductAndVariant = () => {
        Swal.fire({
            title: 'Tạo sản phẩm',
            text: 'Bạn có chắc muốn tạo sản phẩm này không?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Tạo',
            cancelButtonText: 'Hủy',
        }).then(async (result) => {
            const productCreationRequest = {
                name: name,
                description: description,
                price: price,
                brandId: selectedBrand,
                categoryId: selectedCategory,
                gender: selectedGender,
                variants: variants.map(variant => ({
                    size: variant.size,
                    color: variant.color,
                    stockQuantity: variant.stockQuantity,
                    price: variant.price,
                    defaultVariant: variant.defaultVariant,
                    imageAvatarFile: variant.avatar,
                    imageOtherFiles: variant.relatedImages
                }))
            }

            if (result.isConfirmed) {
                try {
                    const response = await createProduct(productCreationRequest);
                    toast.success(response.data.message, { autoClose: 3000 });
                    setName('');
                    setDescription('');
                    setPrice('');
                    setSelectedBrand('');
                    setSelectedCategory('');
                    setSelectedGender('');
                    setVariants([]);
                    setSelectedSizes([]);
                    setSelectedColors([]);
                    setFormattedPrice('');
                } catch (error) {
                    console.error('Error creating product:', error);
                    toast.error('Có lỗi xảy ra khi tạo sản phẩm', { autoClose: 3000 });
                }
            }
        }
        );
    };

    const handleVariantPriceChange = (index: number, value: number) => {
        setVariants((prevVariants) =>
            prevVariants.map((variant, i) =>
                i === index ? { ...variant, price: value } : variant
            )
        );
    };

    const handleVariantStockQuantityChange = (index: number, value: number) => {
        setVariants((prevVariants) =>
            prevVariants.map((variant, i) =>
                i === index ? { ...variant, stockQuantity: value } : variant
            )
        );
    };

    const handleSetDefaultVariant = (index: number) => {
        const updatedVariants = variants.map((variant, i) => ({
            ...variant,
            defaultVariant: i === index // Đặt true cho biến thể được chọn và false cho các biến thể khác
        }));
        setVariants(updatedVariants);
    };

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
            const response = await getAllCategorieList();
            setCategories(response.data);
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

    const handleSubmit = () => {
        if (!name || !description || !price || !selectedBrand || selectedSizes.length === 0 || selectedColors.length === 0) {
            toast.error('Vui lòng nhập đầy đủ thông tin sản phẩm và chọn size, màu', { autoClose: 3000 });
            return;
        }

        generateVariants();
    };

    useEffect(() => {
        fetchBrands();
        fetchCategories();
        console.log('brands', categories);
        
        setSizes(Array.from({ length: 14 }, (_, i) => i + 34));
    }, []);

    return (
        <Card sx={{ maxWidth: 800, margin: 'auto', padding: 3, marginTop: 5 }}>
            <Typography variant="h5" sx={{ marginBottom: 2 }}>Tạo sản phẩm mới và biến thể</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
                <TextField label="Tên sản phẩm" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
                <TextField label="Mô tả sản phẩm" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={4} required />
                <TextField label="Giá" 
                    type="text" 
                    value={formattedPrice} 
                    // onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')} 
                    onChange={handlePriceChange}
                    fullWidth 
                required />

                <FormControl fullWidth>
                    <InputLabel id="brand-select-label">Thương hiệu</InputLabel>
                    <Select labelId="brand-select-label" value={selectedBrand || 'no-brand'} onChange={(e) => setSelectedBrand(Number(e.target.value))} label="Thương hiệu" required>
                        <MenuItem value="no-brand">Chưa chọn</MenuItem>
                        {brands.map((brand) => (
                            <MenuItem key={brand.id} value={brand.id}>{brand.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel id="category-select-label">Thể loại</InputLabel>
                    <Select labelId="category-select-label" value={selectedCategory || 'no-cate'} onChange={(e) => setSelectedCategory(Number(e.target.value))} label="Thể loại">
                        <MenuItem value="no-cate">Chưa chọn</MenuItem>
                        {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel id="gender-select-label">Giới tính</InputLabel>
                    <Select labelId="gender-select-label" value={selectedGender} onChange={(e) => setSelectedGender(e.target.value as string)} label="Giới tính">
                        <MenuItem value="MALE">Nam</MenuItem>
                        <MenuItem value="FEMALE">Nữ</MenuItem>
                        <MenuItem value="UNISEX">Unisex</MenuItem>
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
                        <Button
                            variant={'outlined'}
                            sx={{
                                backgroundColor: 'white',
                                color: 'blue',
                                border: `1px solid 'blue`,
                                minWidth: 40,
                                minHeight: 40,
                            }}
                            onClick={handleOpenDialogAddColor}
                        >
                            +
                        </Button>
                    </Box>
                    {/* <Typography sx={{ marginTop: 2 }}>Màu đã chọn: {selectedColors.join(', ')}</Typography> */}
                </Card>

                <Button variant="contained" color="primary" onClick={handleSubmit}>Tạo danh sách biến thể</Button>

                {/* Hiển thị biến thể */}
                {variants.length > 0 && (
                    <VariantForm
                        variants={variants}
                        handleVariantPriceChange={handleVariantPriceChange}
                        handleVariantStockQuantityChange={handleVariantStockQuantityChange}
                        handleSetDefaultVariant={handleSetDefaultVariant}
                        setVariants={setVariants}
                    />
                )}
            </Box>
            <Box sx={{ marginTop: 3, display: 'flex', justifyContent: 'end' }}>
                <Button variant="contained" color="primary" onClick={handleCreateProductAndVariant}>Tạo sản phẩm</Button>
            </Box>
            <ToastContainer />
            {/* Dialog để thêm màu mới */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
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
                    <Button onClick={handleCloseDialog} color="primary">
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

export default CreateProductWithVariants;