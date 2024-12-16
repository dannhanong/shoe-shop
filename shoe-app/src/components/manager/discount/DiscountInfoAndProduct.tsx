import { Box, Button, Checkbox, Chip, Grid, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import Pagination from '../../common/Pagination'

interface DiscountInfoAndProductProps {
    name: string;
    setName: (name: string) => void;
    discountRate: number;
    setDiscountRate: (discountRate: number) => void;
    description: string;
    setDescription: (description: string) => void;
    startDate: string;
    setStartDate: (startDate: string) => void;
    endDate: string;
    setEndDate: (endDate: string) => void;
    selectedVariantIds: number[];
    setSelectedVariantIds: (selectedVariantIds: number[]) => void;
    products: any[];
    keyword: string;
    setKeyword: (keyword: string) => void;
    selectedProductIds: number[];
    setSelectedProductIds: (selectedProductIds: number[]) => void;
    currentPage: number;
    setCurrentPage: (currentPage: number) => void;
    totalPages: number;
    handleSubmit: () => void;
    handleKeywordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleCheckboxChange: (productId: number) => void;        
}

const DiscountInfoAndProduct: React.FC<DiscountInfoAndProductProps> = (
    { name, setName, discountRate, setDiscountRate, description, setDescription, startDate, setStartDate, endDate, setEndDate, selectedVariantIds, setSelectedVariantIds, products, keyword, setKeyword, selectedProductIds, setSelectedProductIds, currentPage, setCurrentPage, totalPages, handleSubmit, handleKeywordChange, handleCheckboxChange }
) => {
    const [error, setError] = useState<string | null>(null);
    

    const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (value >= 0 && value <= 90) {
            setDiscountRate(value);
            setError(null); // Xóa lỗi nếu giá trị hợp lệ
        } else {
            setError('Giá trị giảm phải nằm trong khoảng từ 1% đến 90%');
        }
    };
    
    return (
        <Grid container spacing={8}>
            {/* Form Inputs */}
            <Grid item xs={12} md={4}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                    Cập nhật đợt giảm giá
                </Typography>
                <TextField
                    label="Tên khuyến mại"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 2 }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <TextField
                    label="Giá trị giảm"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 2 }}
                    value={discountRate}
                    // onChange={(e) => setDiscountRate(Number(e.target.value))}
                    onChange={handleDiscountChange}
                    error={!!error}
                    helperText={error || ''}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                />
                <TextField
                    label="Mô tả"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 2 }}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <TextField
                    label="Ngày bắt đầu"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <TextField
                    label="Ngày kết thúc"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
                {
                    selectedVariantIds.length > 0 && (
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ mb: 2 }}
                            onClick={handleSubmit}
                        >
                            Cập nhật khuyến mại
                        </Button>
                    )
                }
            </Grid>

            {/* Product List */}
            <Grid item xs={12} md={8}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Sản phẩm</Typography>
                    <TextField
                        label="Tìm kiếm"
                        variant="outlined"
                        size="small"
                        sx={{ width: 300 }}
                        value={keyword}
                        onChange={handleKeywordChange}
                    />
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">
                                </TableCell>
                                <TableCell align="center">STT</TableCell>
                                <TableCell align="center">Mã sản phẩm</TableCell>
                                <TableCell align="center">Tên sản phẩm</TableCell>
                                <TableCell align="center">Trạng thái</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.map((product, index) => (
                                <TableRow key={product.id}>
                                    <TableCell align="center">
                                        <Checkbox
                                            checked={selectedProductIds.includes(product.id)}
                                            onChange={() => handleCheckboxChange(product.id)}
                                        />
                                    </TableCell>
                                    <TableCell align="center">{(index + 1) * (currentPage + 1)}</TableCell>
                                    <TableCell align="center">SP{product.id}</TableCell>
                                    <TableCell align="center">{product.name}</TableCell>
                                    <TableCell align="center">
                                        {
                                            product.status === true ? (
                                                <Chip label="Kinh doanh" color="primary" />
                                            ) : (
                                                <Chip label="Ngừng kinh doanh" color="error" />
                                            )
                                        }
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(newPage) => setCurrentPage(newPage)}
                />
            </Grid>
        </Grid>
    )
}

export default DiscountInfoAndProduct
