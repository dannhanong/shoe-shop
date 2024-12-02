import { Product } from "./Product";

export interface Variant {
    id: number;
    size: number;
    color: string;
    stockQuantity: number;
    product: Product;
    price: number;
    discountRate: number;
    priceAfterDiscount: number;
    defaultVariant: boolean;
    imageAvatar: string;
    imageOthers: string[];

    quantity: number;
    variantId: number;

    colors: string[];
    sizes: number[];
}