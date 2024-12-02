import { User } from "./User";
import { Variant } from "./Variant";

export interface Cart {
    id: number;
    user: User;
    cartItems: {
        id: number;
        cart: Cart;
        productVariant: Variant;
        quantity: number;
        price: number;
    }[];
    totalPrice: number;

    cartItemResponses: {
        id: number;
        productVariantDetailsResponse: Variant;
        quantity: number;
        price: number;
    }[];
}