export interface ProductCreationRequest {
    name: string;
    description: string;
    price: number | '';
    brandId: number  | '';
    categoryId: number | '';
    gender: string;
    variants: {
        size: number;
        color: string;
        stockQuantity: number | '';
        price: number;
        defaultVariant: boolean;
        imageAvatarFile: File | null;
        imageOtherFiles: File[];
    }[];
}