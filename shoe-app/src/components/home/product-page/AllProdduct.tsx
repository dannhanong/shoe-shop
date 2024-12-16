import React, { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
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

    const { addItemToCart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const { keyword } = location.state || {};

    // Fetch danh sách sản phẩm từ API
    const getAllProductVariant = async () => {
        try {
            const { minPrice, maxPrice, brandIds } = filters;
            const response = await filterProductVariantDefaults(minPrice, maxPrice, brandIds, 0, size, '', '');
            setProducts(response.data.content);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Không thể tải danh sách sản phẩm.');
        }
    };

    const getAllProductVariantByKeyword = async () => {
        try {
            const response = await getAllProductVariantDefaults(keyword, 0, size, '', '');
            setProducts(response.data.content);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Không thể tải danh sách sản phẩm.');
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

    return (
        <Box sx={{ display: 'flex' }}>
            <ProductFilters onFilterChange={handleFilterChange} />

            {/* Danh sách sản phẩm */}
            <Box sx={{ width: '78%', padding: 2, paddingX: 4 }}>
                <h1 className="text-3xl font-bold mb-4">Tất cả sản phẩm</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="relative border rounded-lg shadow-md overflow-hidden"
                            onMouseEnter={() => setHoveredProductId(product.id)}
                            onMouseLeave={() => setHoveredProductId(null)}
                        >
                            <img
                                src={`${process.env.REACT_APP_BASE_URL}/files/preview/${product.imageAvatar}`}
                                alt={product.product.name}
                                className="w-full h-48 object-cover md:h-64 cursor-pointer"
                                onClick={() => navigate(`/product-detail/${product.id}`)}
                            />
                            {product.price !== product.priceAfterDiscount && (
                                <DiscountLabel discount={product.discountRate} />
                            )}
                            <h3 className="text-lg font-semibold my-2">{product.product.name}</h3>
                            <div className='px-4 py-2'>
                                {product.discountRate > 0 ? (
                                    <div className='flex flex-col justify-end'>
                                        <span className="text-gray-400 line-through text-end">{product.price.toLocaleString()} VNĐ</span>
                                        <span className="text-red-600 font-bold text-end">{product.priceAfterDiscount.toLocaleString()} VNĐ</span>
                                    </div>
                                ) : (
                                    <div className='flex flex-col justify-end'>
                                        <span className="text-gray-400 text-end mt-5">{product.price.toLocaleString()} VNĐ</span>
                                    </div>
                                )}
                            </div>
                            {hoveredProductId === product.id && (
                                <div className="absolute top-24 right-2">
                                    <button
                                        className="bg-white p-2 rounded-full shadow hover:bg-gray-200 mb-1"
                                        onClick={() => addProductToCart(product.id)}
                                    >
                                        <FaCartPlus size={22} />
                                    </button>
                                    <br />
                                    <button
                                        className="bg-white p-2 rounded-full shadow hover:bg-gray-200 mt-1"
                                        onClick={() => handleOpenProductDialog(product)}
                                    >
                                        <CgDetailsMore size={22} />
                                    </button>
                                </div>
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
                        </div>
                    ))}
                </div>

                {
                    products.length === 0 ? (
                        <Box sx={{ textAlign: 'center', marginTop: 4 }}>
                            <h3>Không tìm thấy sản phẩm nào</h3>
                        </Box>
                    ) : (
                        <Box marginTop={5}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setSize(size + 6)}
                            >
                                Tải thêm
                            </Button>
                        </Box>
                    )
                }
                <ToastContainer />
            </Box>
        </Box>
    );
};

export default AllProdduct;