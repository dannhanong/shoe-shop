import { Box, Card, Checkbox, FormControlLabel, Grid, IconButton, TextField, Typography } from '@mui/material';
import * as yup from 'yup';
import React, { useState } from 'react';
import { FaRegFileImage } from 'react-icons/fa6';

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

interface VariantFormProps {
    variants: Variant[];
    handleVariantPriceChange: (index: number, price: number) => void;
    handleVariantStockQuantityChange: (index: number, quantity: number) => void;
    handleSetDefaultVariant: (index: number) => void;
    setVariants: React.Dispatch<React.SetStateAction<Variant[]>>;
}

// Định dạng số với dấu phân cách hàng nghìn
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
};

const VariantForm: React.FC<VariantFormProps> = ({
    variants,
    handleVariantPriceChange,
    handleVariantStockQuantityChange,
    handleSetDefaultVariant,
    setVariants,
}) => {
    // Hàm nhóm các biến thể theo màu sắc
    const groupByColor = (variants: Variant[]) => {
        return variants.reduce((groups, variant) => {
            const color = variant.color;
            if (!groups[color]) groups[color] = [];
            groups[color].push(variant);
            return groups;
        }, {} as Record<string, Variant[]>);
    };

    const groupedVariants = groupByColor(variants);

    // Hàm xử lý thay đổi avatar cho một nhóm
    const handleAvatarChangeForGroup = (color: string, e: any) => {
        const file = e.target.files[0];
        const preview = URL.createObjectURL(file);
        const updatedVariants = variants.map((variant) =>
            variant.color === color ? { ...variant, avatar: file, avatarPreview: preview } : variant
        );
        setVariants(updatedVariants);
    };

    // Hàm xử lý thay đổi ảnh liên quan cho một nhóm
    const handleRelatedImagesChangeForGroup = (color: string, e: any) => {
        const files: File[] = Array.from(e.target.files);
        const previews = files.map((file) => URL.createObjectURL(file as Blob));
        const updatedVariants = variants.map((variant) =>
            variant.color === color
                ? {
                      ...variant,
                      relatedImages: [...variant.relatedImages, ...files].slice(0, 6),
                      relatedImagesPreviews: [...variant.relatedImagesPreviews, ...previews].slice(0, 6),
                  }
                : variant
        );
        setVariants(updatedVariants);
    };

    // Hàm xử lý xóa ảnh liên quan
    const handleRemoveRelatedImage = (color: string, index: number) => {
        const updatedVariants = variants.map((variant) =>
            variant.color === color
                ? {
                      ...variant,
                      relatedImages: variant.relatedImages.filter((_, i) => i !== index),
                      relatedImagesPreviews: variant.relatedImagesPreviews.filter((_, i) => i !== index),
                  }
                : variant
        );
        setVariants(updatedVariants);
    };

    const handlePriceChange = (index: number, value: string) => {
        // Loại bỏ các ký tự không phải số và định dạng lại
        const formattedValue = value.replace(/[^\d]/g, '');
        const numberValue = Number(formattedValue);

        if (!isNaN(numberValue)) {
            handleVariantPriceChange(index, numberValue);
        }
    };

    const stockQuantitySchema = yup
        .number()
        .typeError('Số lượng phải là một số')
        .required('Số lượng là bắt buộc')
        .min(0, 'Số lượng không được âm');

    const [error, setError] = useState<string | null>(null);

    return (        
        <Box>
            <Typography variant="h6" sx={{ marginTop: 2 }}>
                Danh sách biến thể
            </Typography>
            <Grid container spacing={2}>
                {Object.entries(groupedVariants).map(([color, variantsInGroup]) => (
                    <Grid item xs={12} md={6} lg={12} key={color}>
                        <Card sx={{ padding: 2, border: '1px solid #ccc', borderRadius: 2 }}>
                            <Typography>
                                Biến thể có màu sắc:
                                <Box
                                    component="span"
                                    sx={{
                                        display: 'inline-block',
                                        width: 20,
                                        height: 20,
                                        backgroundColor: color,
                                        marginLeft: 1,
                                        border: '1px solid #000',
                                    }}
                                />
                            </Typography>

                            {/* Avatar chung cho nhóm */}
                            <Box sx={{ minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', marginY: 2 }}>
                                <Typography sx={{ marginRight: 3 }}>Ảnh hiển thị: </Typography>
                                <label
                                    htmlFor={`avatar-upload-${color}`}
                                    style={{
                                        display: 'inline-block',
                                        width: 100,
                                        height: 100,
                                        // borderRadius: '50%',
                                        backgroundImage: `url(${
                                            variantsInGroup[0].avatarPreview || '/dist/images/default_upload.png'
                                        })`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        cursor: 'pointer',
                                        border: '1px solid #ccc',
                                    }}
                                >
                                    <input
                                        type="file"
                                        id={`avatar-upload-${color}`}
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleAvatarChangeForGroup(color, e)}
                                    />
                                </label>
                            </Box>

                            {/* Ảnh liên quan */}
                            <Box sx={{ minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography>Ảnh liên quan:</Typography>
                                <Box display="flex" alignItems="center" gap={1} marginTop={2}>
                                    <Box display="flex" gap={1} sx={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                                        {variantsInGroup[0].relatedImagesPreviews.map((preview, i) => (
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
                                                    onClick={() => handleRemoveRelatedImage(color, i)}
                                                >
                                                    &times;
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </Box>
                                    {/* Ẩn nút tải lên nếu đã có đủ 5 ảnh */}
                                    {variantsInGroup[0].relatedImagesPreviews.length < 5 && (
                                        <IconButton color="secondary" component="label">
                                            <FaRegFileImage color="blue" />
                                            <input
                                                type="file"
                                                hidden
                                                multiple
                                                onChange={(e) => handleRelatedImagesChangeForGroup(color, e)}
                                            />
                                        </IconButton>
                                    )}
                                </Box>
                            </Box>

                            {/* Danh sách biến thể trong nhóm */}
                            {variantsInGroup.map((variant, index) => (
                                <Box key={index} sx={{ marginTop: 2 }}>
                                    <Typography><strong>Size: {variant.size}</strong></Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                sx={{ marginX: 2 }}
                                                label="Giá"
                                                type="text" 
                                                value={formatPrice(variant.price)}
                                                fullWidth
                                                margin="normal"
                                                onChange={(e) =>
                                                    handlePriceChange(variants.indexOf(variant), e.target.value)
                                                }
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                sx={{ marginX: 2 }}
                                                label="Số lượng"
                                                type="number"
                                                fullWidth
                                                margin="normal"
                                                value={variant.stockQuantity || ''}
                                                onChange={async (e) => {
                                                    const inputValue = Number(e.target.value);

                                                    // Validate giá trị bằng schema Yup
                                                    try {
                                                        await stockQuantitySchema.validate(inputValue);
                                                        handleVariantStockQuantityChange(variants.indexOf(variant), inputValue);
                                                        setError(null); // Nếu không có lỗi, xóa thông báo lỗi
                                                    } catch (validationError: any) {
                                                        setError(validationError.message); // Ghi lại lỗi
                                                    }
                                                }}
                                                error={!!error} // Hiển thị trạng thái lỗi
                                                helperText={error} // Hiển thị thông báo lỗi
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <FormControlLabel
                                                sx={{ marginTop: 1 }}
                                                control={
                                                    <Checkbox
                                                        checked={variant.defaultVariant}
                                                        onChange={() =>
                                                            handleSetDefaultVariant(variants.indexOf(variant))
                                                        }
                                                        color="secondary"
                                                    />
                                                }
                                                label={variant.defaultVariant ? 'Mặc định' : 'Chọn làm mặc định'}
                                            />
                                        </Grid>
                                    </Box>
                                </Box>
                            ))}
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default VariantForm;