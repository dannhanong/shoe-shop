import React, { useEffect, useState } from "react";
import {
    Box,
    Grid,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Typography,
    Chip,
    InputAdornment,
} from "@mui/material";
import { Product } from "../../../models/Product";
import { useNavigate } from "react-router-dom";
import { getAllProducts, getVariantByProduct } from "../../../services/product.service";
import Pagination from "../../common/Pagination";
import { Variant } from "../../../models/Variant";
import { set } from "lodash";
import { createDiscount } from "../../../services/discount.service";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";

const CreateDiscount: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [keyword, setKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
    const [variants, setVariants] = useState<Variant[] | null>(null);
    const [selectedVariantIds, setSelectedVariantIds] = useState<number[]>([]);

    const [name, setName] = useState('');
    const [discountRate, setDiscountRate] = useState(0);
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        Swal.fire({
            title: 'Bạn có chắc chắn muốn thêm khuyến mại này không?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
        }).then( async (result) => {
            if (result.isConfirmed) {
                const seasonalDiscountCreation = {
                    name,
                    discountRate,
                    startDate,
                    endDate,
                    description: description,
                    applicableProductIds: selectedVariantIds,
                }
                const response = await createDiscount(seasonalDiscountCreation);
                if(response) {
                    Swal.fire({
                        title: 'Thêm khuyến mại thành công',
                        icon: 'success',
                    })

                    setName('');
                    setDiscountRate(0);
                    setDescription('');
                    setStartDate('');
                    setEndDate('');
                    setSelectedProductIds([]);
                    setSelectedVariantIds([]);
                    setVariants(null);
                } else {
                    toast.error("Thêm khuyến mại thất bại", {
                        autoClose: 3000,
                    });
                }
            }
        })
    }

    const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (value >= 0 && value <= 90) {
          setDiscountRate(value);
          setError(null); // Xóa lỗi nếu giá trị hợp lệ
        } else {
          setError('Giá trị giảm phải nằm trong khoảng từ 1% đến 90%');
        }
    };

    const fetchAllProducts = async (page: number) => {
        const response = await getAllProducts(keyword, 'true', page, 4, '', '');
        setProducts(response.data.content);
        setTotalPages(response.data.page.totalPages);
    };

    const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
    };

    const handleCheckboxChange = async (productId: number) => {
        setSelectedProductIds((prevSelected) => {
            try{
                const newSelected = prevSelected.includes(productId)
                ? prevSelected.filter((id) => id !== productId)
                : [...prevSelected, productId];
    
                // Use the updated state value here
                getVariantByProduct(newSelected).then((response) => {
                    setVariants(response.data.content);
                });

                return newSelected;
            } catch (error) {
                setSelectedProductIds([]);
                setVariants([]);
                return prevSelected;
            }
        });
    };

    const handleCheckboxVariantChange = (variantId: number) => {
        setSelectedVariantIds((prevSelected) => {
            const newSelected = prevSelected.includes(variantId)
                ? prevSelected.filter((id) => id !== variantId)
                : [...prevSelected, variantId];
            console.log("selectedVariantIds", newSelected);
            return newSelected;
        });
    };

    useEffect(() => {
        fetchAllProducts(currentPage);
    }, [keyword, currentPage]);

    return (
        <Box sx={{ padding: 4 }}>
            <Grid container spacing={8}>
                {/* Form Inputs */}
                <Grid item xs={12} md={4}>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                        Thêm đợt giảm giá
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
                                Thêm khuyến mại
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
            <br />
            {/* Variant List */}
            {   
                variants ? (
                    <Box mt={4}>
                        <Typography variant="h6">Danh sách biến thể</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center"></TableCell>
                                        <TableCell align="center">STT</TableCell>
                                        <TableCell align="center">Size</TableCell>
                                        <TableCell align="center">Màu sắc</TableCell>
                                        <TableCell align="center">Số lượng</TableCell>
                                        <TableCell align="center">Giá</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {variants.map((variant, index) => 
                                        variant.discountRate <= 0 && (
                                            <TableRow key={variant.id}>
                                                <TableCell align="center">
                                                    <Checkbox
                                                        checked={selectedVariantIds.includes(variant.id)}
                                                        onChange={() => handleCheckboxVariantChange(variant.id)}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">{(index + 1) * (currentPage + 1)}</TableCell>
                                                <TableCell align="center">{variant.size}</TableCell>
                                                <TableCell align="center">
                                                    <div style={{ width: 20, height: 20, backgroundColor: variant.color, borderRadius: '50%' }} />
                                                </TableCell>
                                                <TableCell align="center">{variant.stockQuantity}</TableCell>
                                                <TableCell align="center">{variant.price.toLocaleString()}</TableCell>
                                            </TableRow>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <ToastContainer />
                    </Box>
                ) :
                <Box mt={4}>
                    <Typography variant="h6">Chọn sản phẩm để xem biến thể</Typography>
                </Box>
            }
        </Box>
    );
};

export default CreateDiscount;