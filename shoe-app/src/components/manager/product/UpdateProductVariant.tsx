import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    Grid,
    TextField,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    FormControlLabel,
    Checkbox,
} from '@mui/material';
import { FaRegFileImage } from 'react-icons/fa';
import { deleteVariant, getVariantsByProductId, updateProductApi } from '../../../services/product.service';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';
import { Brand } from '../../../models/Brand';
import { Category } from '../../../models/Category';
import { getAllBrands } from '../../../services/brand.service';
import { getAllCategorieList } from '../../../services/category.service';
import Pagination from '../../common/Pagination';
import { CiEdit } from 'react-icons/ci';
import { MdDeleteForever } from 'react-icons/md';
import { Product } from '../../../models/Product';
import { Variant } from '../../../models/Variant';
import { toast, ToastContainer } from 'react-toastify';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UpdateProductVariant: React.FC = () => {
    const param = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [groupedVariants, setGroupedVariants] = useState<Record<string, Variant[]>>({});

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    const [selectedBrand, setSelectedBrand] = useState<number | ''>('');
    const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
    const [selectedGender, setSelectedGender] = useState<string | ''>('');
    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const ntc = require('ntcjs');

    const handleDeleteVariant = (id: number) => {
        Swal.fire({
            title: 'Xác nhận',
            text: 'Bạn có muốn xóa biến thể này không?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await deleteVariant(id);
                if (response) {
                    toast.success('Xóa biến thể thành công', {
                        autoClose: 3000,
                    });
                    fetchProductAndVariants();
                }
            }
        });
    };

    const handleUpdateProduct = async () => {
        Swal.fire({
            title: 'Xác nhận',
            text: 'Bạn có muốn cập nhật sản phẩm này không?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Cập nhật',
            cancelButtonText: 'Hủy',
        }).then(async (result) => {
            const response = await updateProductApi(
                Number(param.id),
                name,
                description,
                Number(price),
                Number(selectedBrand),
                Number(selectedCategory),
                selectedGender
            );
            if (response) {
                toast.success('Cập nhật sản phẩm thành công', {
                    autoClose: 3000,
                });
                fetchProductAndVariants();
            }
        }
        );
    }
            

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

    const fetchProductAndVariants = async () => {
        try {
            const response = await getVariantsByProductId(Number(param.id));
            const variantsData = response.data;

            if (variantsData.length > 0) {
                setProduct(variantsData[0].product);
                setName(variantsData[0].product.name);
                setDescription(variantsData[0].product.description);
                setPrice(variantsData[0].product.price);
                setSelectedBrand(variantsData[0].product.brand.id);
                setSelectedCategory(variantsData[0].product.category.id);
                setSelectedGender(variantsData[0].product.gender);

                // const mappedVariants = variantsData.map((variant: any) => ({
                //     id: variant.id,
                //     size: variant.size,
                //     color: variant.color,
                //     price: variant.price,
                //     stockQuantity: variant.stockQuantity,
                //     defaultVariant: variant.defaultVariant,
                //     avatar: variant.imageAvatar,
                //     relatedImages: variant.imageOthers,
                //     avatarPreview: variant.imageAvatar
                //         ? `${BASE_URL}/files/preview/${variant.imageAvatar}`
                //         : null,
                //     relatedImagesPreviews: variant.imageOthers.map(
                //         (img: string) => `${BASE_URL}/files/preview/${img}`
                //     ),
                // }));

                // setVariants(mappedVariants);

                // const grouped = mappedVariants.reduce((groups: Record<string, Variant[]>, variant: Variant) => {
                //     if (!groups[variant.color]) groups[variant.color] = [];
                //     groups[variant.color].push(variant);
                //     return groups;
                // }, {});
                // setGroupedVariants(grouped);

                setVariants(variantsData);
            }
        } catch (error) {
            console.error('Error fetching variants:', error);
        }
    };

    useEffect(() => {
        fetchBrands();
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProductAndVariants();
    }, [param.id]);

    const handleUpdateGroup = (color: string, updatedGroup: Variant[]) => {
        setGroupedVariants((prev) => ({
            ...prev,
            [color]: updatedGroup,
        }));

        const updatedVariants = variants.map((variant) =>
            variant.color === color
                ? updatedGroup.find((v) => v.id === variant.id) || variant
                : variant
        );
        setVariants(updatedVariants);
    };

    const handleAvatarChange = (color: string, file: File) => {
        const preview = URL.createObjectURL(file);

        handleUpdateGroup(color, groupedVariants[color].map((variant) => ({
            ...variant,
            avatar: file.name, // Replace with backend-uploaded filename if needed
            avatarPreview: preview,
        })));
    };

    // const handleRelatedImagesChange = (color: string, files: File[]) => {
    //     const previews = files.map((file) => URL.createObjectURL(file));

    //     handleUpdateGroup(color, groupedVariants[color].map((variant) => ({
    //         ...variant,
    //         relatedImages: [...variant.relatedImages, ...files.map((file) => file.name)].slice(0, 6), // Replace with backend-uploaded filenames if needed
    //         relatedImagesPreviews: [...(variant.relatedImagesPreviews || []), ...previews].slice(0, 6),
    //     })));
    // };

    // const handleRemoveRelatedImage = (color: string, index: number) => {
    //     handleUpdateGroup(color, groupedVariants[color].map((variant) => ({
    //         ...variant,
    //         relatedImages: variant.relatedImages.filter((_, i) => i !== index),
    //         relatedImagesPreviews: variant.relatedImagesPreviews?.filter((_, i) => i !== index),
    //     })));
    // };

    const handleSave = async () => {
        Swal.fire({
            title: 'Xác nhận',
            text: 'Bạn có muốn lưu thay đổi không?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Lưu',
            cancelButtonText: 'Hủy',
        }).then(async (result) => {
            if (result.isConfirmed) {
                console.log('Product:', product);
                console.log('Variants:', variants);
                Swal.fire('Thành công!', 'Thay đổi đã được lưu.', 'success');
            }
        });
    };

    return (
        <Card sx={{ maxWidth: 1000, margin: 'auto', padding: 3, marginTop: 5 }}>
            {product && (
                <>
                    <Typography variant="h5">{`Cập nhật sản phẩm: ${product.name}`}</Typography>
                </>
            )}
            <Box display="flex" flexDirection="column" gap={2}>
                <TextField label="Tên sản phẩm" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
                <TextField label="Mô tả sản phẩm" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={4} required />
                {/* <TextField label="Giá" type="number" value={price} onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')} fullWidth required /> */}

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

                <Button
                    variant="contained"
                    component="label"
                    onClick={handleUpdateProduct}
                >
                    Cập nhật sản phẩm
                </Button>
            </Box>
            <Typography variant="h6" sx={{ marginTop: 4 }}>
                Danh sách biến thể
            </Typography>
            <table className="w-full table-auto border-collapse">
                <thead>
                    <tr className="bg-orange-500 text-white">
                        <th className="border p-2">STT</th>
                        <th className="border p-2">Mã sản phẩm</th>
                        <th className="border p-2">Tên sản phẩm</th>
                        <th className="border p-2">Màu sắc</th>
                        <th className="border p-2">Kích cỡ</th>
                        <th className="border p-2">Hình ảnh</th>
                        <th className="border p-2">Số lượng còn</th>
                        <th className="border p-2">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {variants.map((variant, index) => (
                        <tr key={variant.id} className="bg-white hover:bg-gray-100">
                            <td className="border p-2 text-center">{index + 1}</td>
                            <td className="border p-2">{'SPV' + variant.id}</td>
                            <td className="border p-2">{variant.product.name}</td>
                            <td className="border p-2 text-center">
                                <div style={{ width: 20, height: 20, backgroundColor: variant.color, borderRadius: '50%', marginLeft: '38%' }} />
                                <div>{ntc.name(variant.color)[1]}</div>
                            </td>
                            <td className="border p-2">{variant.size}</td>
                            <td className="border p-2 flex justify-center">
                                <img
                                    src={`${process.env.REACT_APP_BASE_URL}/files/preview/${variant.imageAvatar}`}
                                    alt="Avatar"
                                    width={70} height={70}
                                />
                            </td>
                            <td className="border p-2">{variant.stockQuantity}</td>
                            <td className="border p-2 text-center">
                                <div className="flex justify-center items-center space-x-3">
                                    <CiEdit size={25} className='cursor-pointer' color='blue' onClick={() => navigate(`/manager/update-variant/${variant.id}`)}/>
                                    {/* <MdDeleteForever size={25} className='cursor-pointer' color='red' onClick={() => handleDeleteVariant(variant.id)}/> */}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <ToastContainer />
        </Card>
    );
};

export default UpdateProductVariant;