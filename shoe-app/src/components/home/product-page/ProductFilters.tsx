import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    FormControl,
    FormGroup,
    FormControlLabel,
    Checkbox,
    RadioGroup,
    Radio,
    Button,
} from '@mui/material';
import { Brand } from '../../../models/Brand';
import { getAllBrands } from '../../../services/brand.service';

interface ProductFiltersProps {
    onFilterChange: (filters: { minPrice: string; maxPrice: string; brandIds: string; }) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ onFilterChange }) => {
    const [priceRange, setPriceRange] = useState<string>('');
    const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);

    const fetchAllBrands = async () => {
        try {
            const response = await getAllBrands('', 0, 10, '', '');
            setBrands(response.data.content);
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    const convertPriceRange = (priceRange: string) => {
        switch (priceRange) {
            case 'below-1M':
                return { minPrice: '0', maxPrice: '999999' };
            case '1M-2M':
                return { minPrice: '1000000', maxPrice: '2000000' };
            case '2M-3M':
                return { minPrice: '2000000', maxPrice: '3000000' };
            case '3M-4M':
                return { minPrice: '3000000', maxPrice: '4000000' };
            case 'above-4M':
                return { minPrice: '4000000', maxPrice: '1000000000' };
            default:
                return { minPrice: '0', maxPrice: '1000000000' };
        }
    };

    const handleApplyFilters = () => {
        const { minPrice, maxPrice } = convertPriceRange(priceRange);
        onFilterChange({
            minPrice,
            maxPrice,
            brandIds: selectedBrandIds.map(String).join(','),
        });
    };

    const handleCancelFilters = () => {
        setPriceRange('');
        setSelectedBrandIds([]);
        onFilterChange({
            minPrice: '0',
            maxPrice: '1000000000',
            brandIds: '',
        });
    };

    useEffect(() => {
        fetchAllBrands();
    }, []);

    return (
        <Box sx={{ width: '20%', minWidth: 324, padding: 2, borderRight: '1px solid #ddd', textAlign: 'left', marginLeft: 1 }}>
            <Typography variant="h6" gutterBottom>
                Khoảng giá
            </Typography>
            <FormControl component="fieldset">
                <RadioGroup
                    name="price-range"
                    value={priceRange}
                    onChange={(event) => setPriceRange(event.target.value)}
                >
                    <FormControlLabel value="below-1M" control={<Radio />} label="Dưới 1.000.000 VNĐ" />
                    <FormControlLabel value="1M-2M" control={<Radio />} label="1.000.000 VNĐ - 2.000.000 VNĐ" />
                    <FormControlLabel value="2M-3M" control={<Radio />} label="2.000.000 VNĐ - 3.000.000 VNĐ" />
                    <FormControlLabel value="3M-4M" control={<Radio />} label="3.000.000 VNĐ - 4.000.000 VNĐ" />
                    <FormControlLabel value="above-4M" control={<Radio />} label="Trên 4.000.000 VNĐ" />
                </RadioGroup>
            </FormControl>

            <Typography variant="h6" gutterBottom sx={{ marginTop: 3 }}>
                Thương hiệu
            </Typography>
            <FormControl component="fieldset">
                <FormGroup>
                    {brands.map((brand) => (
                        <FormControlLabel
                            key={brand.id}
                            control={
                                <Checkbox
                                    checked={selectedBrandIds.includes(brand.id)} // So sánh bằng `id`
                                    onChange={(event) => {
                                        const newBrands = event.target.checked
                                            ? [...selectedBrandIds, brand.id] // Thêm `id` vào mảng
                                            : selectedBrandIds.filter((b) => b !== brand.id); // Xóa `id` khỏi mảng
                                        setSelectedBrandIds(newBrands);
                                    }}
                                />
                            }
                            label={brand.name}
                        />
                    ))}
                </FormGroup>
            </FormControl>
            <br />
            <Button variant="contained" color="primary" sx={{ marginTop: 2 }} onClick={handleApplyFilters}>
                Áp dụng
            </Button>
            {
                priceRange || selectedBrandIds.length > 0 ? (
                    <Button variant="contained" color="error" sx={{ marginTop: 2, marginX: 1 }} onClick={handleCancelFilters}>
                        Hủy
                    </Button>
                ) : null
            }
        </Box>
    );
};

export default ProductFilters;