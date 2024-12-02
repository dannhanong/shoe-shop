import { Brand } from "./Brand";
import { Category } from "./Category";

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    status: boolean;
    category: Category;
    brand: Brand;
    gender: string;
}