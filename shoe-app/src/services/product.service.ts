import axios, { AxiosResponse } from 'axios';
import { Variant } from '../models/Variant';
import { ProductCreationRequest } from '../models/request/ProductCreationRequest';

const BASE_URL = process.env.REACT_APP_BASE_URL;

export const createProduct = async (productCreationRequest: ProductCreationRequest) => {
    const formData = new FormData();
    formData.append('name', productCreationRequest.name);
    formData.append('description', productCreationRequest.description);
    formData.append('price', productCreationRequest.price.toString());
    formData.append('brandId', productCreationRequest.brandId.toString());
    formData.append('categoryId', productCreationRequest.categoryId.toString());
    formData.append('gender', productCreationRequest.gender);
    productCreationRequest.variants.forEach((variant, index) => {
        formData.append(`variants[${index}].size`, variant.size.toString());
        formData.append(`variants[${index}].color`, variant.color);
        formData.append(`variants[${index}].stockQuantity`, variant.stockQuantity.toString());
        formData.append(`variants[${index}].price`, variant.price.toString());
        formData.append(`variants[${index}].defaultVariant`, variant.defaultVariant.toString());
        if (variant.imageAvatarFile) {
            formData.append(`variants[${index}].imageAvatarFile`, variant.imageAvatarFile);
        }
        variant.imageOtherFiles.forEach((file) => {
            formData.append(`variants[${index}].imageOtherFiles`, file);
        });
    });
    return axios.post(`${BASE_URL}/products/staff/create`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
    });
};

// Hàm lấy danh sách sản phẩm
export const getAllProductVariantDefaults = async (keyword = '', page = 0, size = 10, sortBy = '', order = '') => {
    return axios.get(`${BASE_URL}/products/variants/all`, {
        params: {
            keyword,
            page,
            size,
            sortBy,
            order,
        },
    });
};

export const filterProductVariantDefaults = async (minPrice = '', maxPrice = '', brandIds = '', page = 0, size = 10, sortBy = '', order = '') => {
    return axios.get(`${BASE_URL}/products/filter`, {
        params: {
            minPrice,
            maxPrice,
            brandIds,
            page,
            size,
            sortBy,
            order,
        },
    });
};

export const getAllProducts = async (keyword = '', status = '', page = 0, size = 10, sortBy = '', order = '') => {
    return axios.get(`${BASE_URL}/products/all`, {
        params: {
            keyword,
            status,
            page,
            size,
            sortBy,
            order,
        },
    });
};

export const getAllProductVariants = async (keyword = '', page = 0, size = 10, sortBy = '', order = '') => {
    return axios.get(`${BASE_URL}/products/variants-for-sell/all`, {
        params: {
            keyword,
            page,
            size,
            sortBy,
            order,
        },
    });
};

export const updateStatusProduct = async (id: number): Promise<AxiosResponse<any>> => {
    return axios.put(
        `${BASE_URL}/products/staff/update/status/${id}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        }
    );
};

export const getProductVariantResponse = async (id: number): Promise<AxiosResponse<Variant>> => {
    return axios.get(`${BASE_URL}/products/public/variant/${id}`);
}

export const getProductVariantResponseAndRelated = async (id: number, size = 4) => {
    return axios.get(`${BASE_URL}/products/public/variant/details/${id}?size=${size}`);
}

export const getVariantByColor = async (color: string, productId: number) => {
    const encodedColor = encodeURIComponent(color);
    console.log('color', color);
    return (await axios.get(`${BASE_URL}/products/public/variant/details-change/${productId}?color=${encodedColor}`));
}

export const getAllVariantByColor = async (color: string, productId: number) => {
    const encodedColor = encodeURIComponent(color);
    console.log('color', color);
    return (await axios.get(`${BASE_URL}/products/public/variant/details-change-color/${productId}?color=${encodedColor}`));
}

export const getVariantByColorAndSize = async (size: number, color: string, productId: number) => {
    const encodedColor = encodeURIComponent(color);
    console.log('color', color);
    return axios.get(`${BASE_URL}/products/public/variant/details-full/${productId}?size=${size}&color=${encodedColor}`);
}

export const getVariantByProduct = async (productIds: number[], page = 0, size = 10, sortBy = '', order = '') => {
    return axios.get(
        `${BASE_URL}/products/admin/variants/${productIds}`,
        {
            params: {
                page,
                size,
                sortBy,
                order,
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            }
        }
    );
}

export const deleteProduct = async (id: number) => {
    return axios.delete(`${BASE_URL}/products/admin/delete/${id}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
    });
}

export const getVariantsByProductId = async (productId: number) => {
    return axios.get(`${BASE_URL}/products/staff/variants/${productId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
    });
}

export const deleteVariant = async (id: number) => {
    return axios.delete(`${BASE_URL}/products/staff/variant/delete/${id}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
    });
}

export const updateProductApi = async (id: number, name: string, description: string, price: number, brandId: number, categoryId: number, gender: string) => {
    return axios.put(`${BASE_URL}/products/staff/update/${id}`, {
        name,
        description,
        price,
        brandId,
        categoryId,
        gender,
    }, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
    });
}

export const getVariantById = async (id: number) => {
    return axios.get(`${BASE_URL}/products/staff/variant/${id}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
    });
}

export const updateVariantApi = async (id: number, size: number, color: string, stockQuantity: number, price: number) => {
    return axios.put(`${BASE_URL}/products/staff/variant/update/${id}`, {
        size,
        color,
        stockQuantity,
        price,
    }, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
    });
}

export const getTopSellingProducts = async () => {
    return axios.get(`${BASE_URL}/products/public/top-selling`);
}

export const addAvaterImage = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.put(`${BASE_URL}/products/staff/add-avatar/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data', 
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
    });
}

export const deleteOtherImage = async (id: number, fileCode: string) => {
    return axios.delete(`${BASE_URL}/products/staff/delete-other-image/${id}/${fileCode}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
    });
}

export const addOtherImage = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.put(`${BASE_URL}/products/staff/add-other-image/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data', 
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
    });
}
