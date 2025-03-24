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
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
    Badge,
    Paper,
} from '@mui/material';
import { ExpandMore, FilterList, MonetizationOn, BusinessCenter } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Brand } from '../../../models/Brand';
import { getAllBrands } from '../../../services/brand.service';

interface ProductFiltersProps {
    onFilterChange: (filters: { minPrice: string; maxPrice: string; brandIds: string; }) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ onFilterChange }) => {
    const [priceRange, setPriceRange] = useState<string>('');
    const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [expanded, setExpanded] = useState<string | false>('pricePanel');

    const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

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

    const getPriceRangeLabel = (range: string) => {
        switch (range) {
            case 'below-1M': return 'Dưới 1.000.000₫';
            case '1M-2M': return '1.000.000₫ - 2.000.000₫';
            case '2M-3M': return '2.000.000₫ - 3.000.000₫';
            case '3M-4M': return '3.000.000₫ - 4.000.000₫';
            case 'above-4M': return 'Trên 4.000.000₫';
            default: return '';
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

    const handleRemoveBrandFilter = (brandId: number) => {
        setSelectedBrandIds(prev => prev.filter(id => id !== brandId));
    };

    const totalActiveFilters = (priceRange ? 1 : 0) + selectedBrandIds.length;

    useEffect(() => {
        fetchAllBrands();
    }, []);

    return (
        <Paper 
            elevation={3}
            className="transition-all duration-300 hover:shadow-lg"
            sx={{ 
                width: '20%', 
                minWidth: 324, 
                borderRadius: 2, 
                overflow: 'hidden',
                marginLeft: 1
            }}
        >
            <Box className="bg-blue-50 p-4 flex items-center justify-between">
                <Typography variant="h6" className="font-bold flex items-center">
                    <FilterList className="mr-2" />
                    Bộ lọc
                    {totalActiveFilters > 0 && (
                        <Badge 
                            badgeContent={totalActiveFilters} 
                            color="primary" 
                            className="ml-2"
                        />
                    )}
                </Typography>
            </Box>
            
            <Divider />
            
            <Box className="p-4">
                {(priceRange || selectedBrandIds.length > 0) && (
                    <Box className="mb-4 flex flex-wrap gap-2">
                        {priceRange && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Chip
                                    label={`Giá: ${getPriceRangeLabel(priceRange)}`}
                                    onDelete={() => setPriceRange('')}
                                    color="primary"
                                    variant="outlined"
                                    className="shadow-sm"
                                />
                            </motion.div>
                        )}
                        
                        {selectedBrandIds.map(brandId => {
                            const brand = brands.find(b => b.id === brandId);
                            return brand ? (
                                <motion.div
                                    key={brand.id}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Chip
                                        label={`${brand.name}`}
                                        onDelete={() => handleRemoveBrandFilter(brand.id)}
                                        color="primary"
                                        variant="outlined"
                                        className="shadow-sm"
                                    />
                                </motion.div>
                            ) : null;
                        })}
                    </Box>
                )}
                
                <Accordion 
                    expanded={expanded === 'pricePanel'} 
                    onChange={handleChange('pricePanel')}
                    className="shadow-none border border-gray-200 rounded-md mb-3"
                >
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        className="bg-gray-50"
                    >
                        <Typography className="flex items-center font-semibold">
                            <MonetizationOn className="mr-2 text-blue-600" />
                            Khoảng giá
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <FormControl component="fieldset" className="w-full">
                            <RadioGroup
                                name="price-range"
                                value={priceRange}
                                onChange={(event) => setPriceRange(event.target.value)}
                            >
                                {[
                                    { value: 'below-1M', label: 'Dưới 1 triệu VNĐ' },
                                    { value: '1M-2M', label: '1 triệu VNĐ - 2 triệu VNĐ' },
                                    { value: '2M-3M', label: '2 triệu VNĐ - 3 triệu VNĐ' },
                                    { value: '3M-4M', label: '3 triệu VNĐ - 4 triệu VNĐ' },
                                    { value: 'above-4M', label: 'Trên 4 triệu VNĐ' }
                                ].map(option => (
                                    <FormControlLabel
                                        key={option.value}
                                        value={option.value}
                                        control={<Radio color="primary" />}
                                        label={option.label}
                                        className={`transition-all duration-200 hover:bg-blue-50 rounded-md px-2 ${priceRange === option.value ? 'bg-blue-100' : ''}`}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>
                    </AccordionDetails>
                </Accordion>

                <Accordion 
                    expanded={expanded === 'brandPanel'} 
                    onChange={handleChange('brandPanel')}
                    className="shadow-none border border-gray-200 rounded-md"
                >
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        className="bg-gray-50"
                    >
                        <Typography className="flex items-center font-semibold">
                            <BusinessCenter className="mr-2 text-blue-600" />
                            Thương hiệu
                            {selectedBrandIds.length > 0 && (
                                <Badge 
                                    badgeContent={selectedBrandIds.length} 
                                    color="primary" 
                                    className="ml-2"
                                />
                            )}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <FormControl component="fieldset" className="w-full">
                            <FormGroup>
                                {brands.map((brand) => (
                                    <FormControlLabel
                                        key={brand.id}
                                        control={
                                            <Checkbox
                                                checked={selectedBrandIds.includes(brand.id)}
                                                onChange={(event) => {
                                                    const newBrands = event.target.checked
                                                        ? [...selectedBrandIds, brand.id]
                                                        : selectedBrandIds.filter((b) => b !== brand.id);
                                                    setSelectedBrandIds(newBrands);
                                                }}
                                                color="primary"
                                            />
                                        }
                                        label={brand.name}
                                        className={`transition-all duration-200 hover:bg-blue-50 rounded-md ${
                                            selectedBrandIds.includes(brand.id) ? 'bg-blue-100' : ''
                                        }`}
                                    />
                                ))}
                            </FormGroup>
                        </FormControl>
                    </AccordionDetails>
                </Accordion>
            </Box>
            
            <Box className="p-4 bg-gray-50 flex flex-col sm:flex-row justify-center gap-2">
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleApplyFilters}
                    className="transition-transform duration-200 hover:scale-105"
                    fullWidth
                    startIcon={<FilterList />}
                >
                    Áp dụng
                </Button>
                
                {(priceRange || selectedBrandIds.length > 0) && (
                    <Button 
                        variant="outlined" 
                        color="error" 
                        onClick={handleCancelFilters}
                        className="transition-transform duration-200 hover:scale-105"
                        fullWidth
                    >
                        Hủy
                    </Button>
                )}
            </Box>
        </Paper>
    );
};

export default ProductFilters;