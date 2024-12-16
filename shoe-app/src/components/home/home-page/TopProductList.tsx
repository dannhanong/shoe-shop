import React, { useEffect, useState } from 'react';
import DiscountLabel from '../../common/DiscountLabel';
import { CgDetailsMore } from "react-icons/cg";
import { FaCartPlus } from 'react-icons/fa6';
import { Variant } from '../../../models/Variant';
import { getTopSellingProducts } from '../../../services/product.service';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../../../services/cart.service';
import { toast, ToastContainer } from 'react-toastify';
import ProductDialog from '../product-page/ProductDialog';
import { useCart } from '../../../contexts/CartContext';
import { isAuthenticated } from '../../../services/auth.service';
import Swal from 'sweetalert2';

const TopProductList: React.FC = () => {
    const [hoveredProductId, setHoveredProductId] = useState<number | null>(null);
    const [products, setProducts] = useState<Variant[]>([]);
    const [isOpenProductDialog, setOpenProductDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const { addItemToCart } = useCart();
    const [padding, setPadding] = useState(0);

    const navigate = useNavigate();

    const getAllProductVariant = async () => {
        const response = await getTopSellingProducts();
        console.log(response.data);
        
        setProducts(response.data);
    }

    const addProductToCart = async (productVariantId: number) => {
        if (isAuthenticated()) {
            const response = await addToCart(productVariantId, 1);
            if (response) {
                await addItemToCart();
                toast.success('Thêm vào giỏ hàng thành công');
            }
        } else {
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
    }

    const handleOpenProductDialog = () => {
        setOpenProductDialog(true);
    };

    const handleCloseProductDialog = () => {        
        setOpenProductDialog(false);
        console.log('close dialog', isOpenProductDialog); 
    };

    const handleChangePadding = () => {
        if (window.innerWidth <= 640) {
            setPadding(0);
        } else if (window.innerWidth <= 768) {
            setPadding(8);
        } else if (window.innerWidth <= 1024) {
            setPadding(16);
        } else {
            setPadding(20);
        }
    };

    useEffect(() => {
        getAllProductVariant();
        handleChangePadding();
        window.addEventListener('resize', handleChangePadding);
        return () => window.removeEventListener('resize', handleChangePadding);
    }, []);

    return (
        <section className="mt-10 mb-10">
            <h2 className="text-2xl font-bold mb-4">SẢN PHẨM BÁN CHẠY</h2>
            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-${padding}`}>
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
                        {product.price !== product.priceAfterDiscount && <DiscountLabel discount={product.discountRate} />}
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
                                <button className="bg-white p-2 rounded-full shadow hover:bg-gray-200 mb-1" onClick={() => addProductToCart(product.id)}>
                                    <FaCartPlus size={22} />
                                </button>
                                <br />
                                <button className="bg-white p-2 rounded-full shadow hover:bg-gray-200 mt-1" onClick={() => {
                                    setSelectedProduct(product);
                                    handleOpenProductDialog();
                                }}>
                                    <CgDetailsMore size={22} />
                                </button>
                            </div>
                        )}

                        {/* ProductDialog should be outside the map loop */}
                        {selectedProduct && (
                            <ProductDialog
                                isOpen={isOpenProductDialog}
                                onClose={handleCloseProductDialog}
                                handleCloseProductDialog={handleCloseProductDialog}
                                product={selectedProduct}
                                setProduct={setSelectedProduct}
                            />
                        )}
                    </div>
                ))}
            </div>
            <ToastContainer />
        </section>
    );
};

export default TopProductList;