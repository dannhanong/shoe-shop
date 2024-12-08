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
import { useNavigate, useParams } from "react-router-dom";
import { getAllProducts, getVariantByProduct } from "../../../services/product.service";
import Pagination from "../../common/Pagination";
import { Variant } from "../../../models/Variant";
import { set } from "lodash";
import { getDiscountById, updateDiscount } from "../../../services/discount.service";
import { toast, ToastContainer } from "react-toastify";
import { Discount } from "../../../models/Discount";
import DiscountInfoAndProduct from "./DiscountInfoAndProduct";

const UpdateDiscount: React.FC = () => {
    const navigate = useNavigate();
    const param = useParams();
    const [discount, setDiscount] = useState<Discount[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [keyword, setKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [selectedVariantIds, setSelectedVariantIds] = useState<number[]>([]);

    const [name, setName] = useState('');
    const [discountRate, setDiscountRate] = useState(0);
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSubmit = async () => {
        const seasonalDiscountCreation = {
            name,
            discountRate,
            startDate,
            endDate,
            description: description,
            applicableProductIds: selectedVariantIds,
        }
        
        const response = await updateDiscount(Number(param.id), seasonalDiscountCreation);

        if (response) {
            toast.success('Cập nhật đợt giảm giá thành công', {
                autoClose: 3000,
            });
            fetchDiscount();
            fetchAllProducts(currentPage);
        } else {
            toast.error('Cập nhật đợt giảm giá thất bại', {
                autoClose: 3000,
            });
        }
    }

    const fetchAllProducts = async (page: number) => {
        const response = await getAllProducts(keyword, 'true', page, 4, '', '');
        setProducts(response.data.content);
        setTotalPages(response.data.page.totalPages);
    };

    const fetchDiscount = async () => {
        try {
            const response = await getDiscountById(Number(param.id));
            setDiscount(response.data);
            setName(response.data.name);
            setDiscountRate(response.data.discountRate);
            setDescription(response.data.description);
            setStartDate(response.data.startDate);
            setEndDate(response.data.endDate);

            setVariants(response.data.applicableProducts);
            setSelectedVariantIds(response.data.applicableProducts.map((variant: Variant) => variant.id));            
        } catch (error) {
            console.error('Error during get products:', error);
        }
    }

    const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
    };

    const handleCheckboxChange = async (productId: number) => {
        setSelectedProductIds((prevSelected) => {
            try {
                // Xác định danh sách sản phẩm đã chọn
                const newSelected = prevSelected.includes(productId)
                    ? prevSelected.filter((id) => id !== productId)
                    : [...prevSelected, productId];

                // Chỉ gọi API nếu có sản phẩm được chọn
                if (newSelected.length > 0) {
                    getVariantByProduct(newSelected).then((response) => {
                        const newVariants = response.data.content;
                        setVariants((prevVariants) => {
                            const mergedVariants = [...prevVariants];
                            newVariants.forEach((variant: Variant) => {
                                if (!prevVariants.some((v) => v.id === variant.id)) {
                                    mergedVariants.push(variant);
                                }
                            });
                            return mergedVariants;
                        });
                    });
                } else {
                    // Nếu không có sản phẩm nào được chọn, reset variants về mảng rỗng
                    setVariants([]);
                }

                return newSelected;
            } catch (error) {
                console.error("Error fetching variants:", error);
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
        fetchDiscount();
    }, []);

    useEffect(() => {
        fetchAllProducts(currentPage);
    }, [keyword, currentPage]);

    return (
        <Box sx={{ padding: 4 }}>
            <DiscountInfoAndProduct
                name={name}
                setName={setName}
                discountRate={discountRate}
                setDiscountRate={setDiscountRate}
                description={description}
                setDescription={setDescription}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                selectedVariantIds={selectedVariantIds}
                setSelectedVariantIds={setSelectedVariantIds}
                products={products}
                keyword={keyword}
                setKeyword={setKeyword}
                selectedProductIds={selectedProductIds}
                setSelectedProductIds={setSelectedProductIds}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                handleSubmit={handleSubmit}
                handleKeywordChange={handleKeywordChange}
                handleCheckboxChange={handleCheckboxChange}
            />
            <br />
            {/* Variant List */}
            {   
                variants ? (
                    <Box mt={4}>
                        <Typography variant="h6">Danh sách biến thể đã áp dụng</Typography>
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

export default UpdateDiscount;