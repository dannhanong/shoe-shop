import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Skeleton, Container, Fade } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import ProductFilters from './ProductFilters';
import DiscountLabel from '../../common/DiscountLabel';
import { FaCartPlus } from 'react-icons/fa6';
import { CgDetailsMore } from 'react-icons/cg';
import { Variant } from '../../../models/Variant';
import { filterProductVariantDefaults, getAllProductVariantDefaults } from '../../../services/product.service';
import { addToCart } from '../../../services/cart.service';
import { useCart } from '../../../contexts/CartContext';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductDialog from './ProductDialog';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { MdFilterNone } from 'react-icons/md';
import { FaSearch } from 'react-icons/fa';

const AllProdduct: React.FC = () => {
    const [hoveredProductId, setHoveredProductId] = useState<number | null>(null);
    const [products, setProducts] = useState<Variant[]>([]);
    const [isOpenProductDialog, setOpenProductDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Variant | null>(null);
    const [filters, setFilters] = useState({
        minPrice: '0',
        maxPrice: '1000000000',
        brandIds: '',
    });
    const [size, setSize] = useState(10);
    const [isLoading, setIsLoading] = useState(true);

    const { addItemToCart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const { keyword } = location.state || {};

    // Fetch danh sách sản phẩm từ API
    const getAllProductVariant = async () => {
        try {
            setIsLoading(true);
            const { minPrice, maxPrice, brandIds } = filters;
            const response = await filterProductVariantDefaults(minPrice, maxPrice, brandIds, 0, size, '', '');
            setProducts(response.data.content);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Không thể tải danh sách sản phẩm.');
            setIsLoading(false);
        }
    };

    const getAllProductVariantByKeyword = async () => {
        try {
            setIsLoading(true);
            const response = await getAllProductVariantDefaults(keyword, 0, size, '', '');
            setProducts(response.data.content);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Không thể tải danh sách sản phẩm.');
            setIsLoading(false);
        }
    };

    // Thêm sản phẩm vào giỏ hàng
    const addProductToCart = async (productVariantId: number) => {
        try {
            const response = await addToCart(productVariantId, 1);
            if (response) {
                await addItemToCart();
                toast.success('Thêm sản phẩm vào giỏ hàng thành công');
            }
        } catch (error) {
            setOpenProductDialog(false);
            Swal.fire({
                title: 'Vui lòng đăng nhập',
                text: 'Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Đăng nhập',
                cancelButtonText: 'Hủy',
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login');
                }
            });
        }
    };

    // Mở Dialog chi tiết sản phẩm
    const handleOpenProductDialog = (product: Variant) => {
        setSelectedProduct(product);
        setOpenProductDialog(true);
    };

    // Đóng Dialog chi tiết sản phẩm
    const handleCloseProductDialog = () => {
        setOpenProductDialog(false);
        setSelectedProduct(null);
    };

    // Xử lý khi bộ lọc thay đổi
    const handleFilterChange = (newFilters: typeof filters) => {
        setFilters(newFilters);
    };

    useEffect(() => {
        getAllProductVariant();
    }, [filters, size]);

    useEffect(() => {
        if (keyword) {
            getAllProductVariantByKeyword();
        }
    }, [keyword]);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <Box sx={{ display: 'flex', backgroundColor: '#f9fafb', width: '100%' }}>
            <ProductFilters onFilterChange={handleFilterChange} />

            {/* Danh sách sản phẩm */}
            <Container maxWidth="xl" sx={{ width: '78%', py: 4, px: { xs: 2, md: 4 } }}>
                <Box className="flex items-center justify-between mb-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Typography variant="h4" component="h1" className="font-bold text-gray-800">
                            {keyword ? `Kết quả tìm kiếm: "${keyword}"` : "Tất cả sản phẩm"}
                        </Typography>
                        {keyword && (
                            <Typography variant="body2" className="text-gray-500 mt-1">
                                Đang hiển thị {products.length} kết quả
                            </Typography>
                        )}
                    </motion.div>
                </Box>

                {isLoading ? (
                    <Box className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, index) => (
                            <Box key={index} className="rounded-lg overflow-hidden bg-white shadow-md">
                                <Skeleton variant="rectangular" height={250} animation="wave" />
                                <Box p={2}>
                                    <Skeleton height={28} width="80%" animation="wave" />
                                    <Skeleton height={24} width="50%" animation="wave" style={{ marginTop: 8 }} />
                                </Box>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    >
                        {products.length > 0 ? products.map((product) => (
                            <motion.div
                                key={product.id}
                                variants={item}
                                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 relative group"
                                whileHover={{ y: -5 }}
                            >
                                <div 
                                    className="relative overflow-hidden cursor-pointer"
                                    onClick={() => navigate(`/product-detail/${product.id}`)}
                                >
                                    <img
                                        src={`${process.env.REACT_APP_BASE_URL}/files/preview/${product.imageAvatar}`}
                                        alt={product.product.name}
                                        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <div className="bg-white p-3 rounded-full">
                                            <FaSearch className="text-gray-800" size={18} />
                                        </div>
                                    </div>
                                </div>

                                {product.price !== product.priceAfterDiscount && (
                                    <DiscountLabel discount={product.discountRate} />
                                )}

                                <Box className="p-4">
                                    <Typography 
                                        variant="h6" 
                                        className="font-semibold text-gray-800 line-clamp-2 h-14 mb-2"
                                        sx={{ minHeight: '3.5rem' }}
                                    >
                                        {product.product.name}
                                    </Typography>

                                    <div className="mt-2">
                                        {product.discountRate > 0 ? (
                                            <div className="flex flex-col">
                                                <Typography variant="body2" className="text-gray-400 line-through text-end">
                                                    {product.price.toLocaleString()} VNĐ
                                                </Typography>
                                                <Typography variant="h6" className="text-red-600 font-bold text-end">
                                                    {product.priceAfterDiscount.toLocaleString()} VNĐ
                                                </Typography>
                                            </div>
                                        ) : (
                                            <Typography variant="h6" className="text-gray-700 font-semibold text-end">
                                                {product.price.toLocaleString()} VNĐ
                                            </Typography>
                                        )}
                                    </div>
                                </Box>
                                
                                <div className="absolute top-4 right-4 flex flex-col gap-2 transform transition-all duration-300 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-white p-2.5 rounded-full shadow-lg hover:bg-blue-50 text-blue-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addProductToCart(product.id);
                                        }}
                                    >
                                        <FaCartPlus size={20} />
                                    </motion.button>
                                    
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-white p-2.5 rounded-full shadow-lg hover:bg-blue-50 text-blue-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenProductDialog(product);
                                        }}
                                    >
                                        <CgDetailsMore size={20} />
                                    </motion.button>
                                </div>
                            </motion.div>
                        )) : (
                            <motion.div 
                                className="col-span-full flex flex-col items-center justify-center py-16"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <MdFilterNone size={80} className="text-gray-300 mb-4" />
                                <Typography variant="h5" className="text-gray-500 font-medium mb-2">
                                    Không tìm thấy sản phẩm nào
                                </Typography>
                                <Typography variant="body1" className="text-gray-400 text-center max-w-md">
                                    Không tìm thấy sản phẩm phù hợp với bộ lọc đã chọn. Vui lòng thử lại với bộ lọc khác.
                                </Typography>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {products.length > 0 && (
                    <Box sx={{ textAlign: 'center', marginTop: 6 }}>
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setSize(size + 6)}
                                size="large"
                                className="px-8 py-2.5"
                                sx={{
                                    borderRadius: '30px',
                                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                }}
                            >
                                Tải thêm sản phẩm
                            </Button>
                        </motion.div>
                    </Box>
                )}

                {/* Dialog sản phẩm */}
                {selectedProduct && (
                    <ProductDialog
                        isOpen={isOpenProductDialog}
                        onClose={handleCloseProductDialog}
                        product={selectedProduct}
                        handleCloseProductDialog={handleCloseProductDialog}
                        setProduct={setSelectedProduct}
                    />
                )}
                
                <ToastContainer position="bottom-right" />
            </Container>
        </Box>
    );
};

export default AllProdduct;