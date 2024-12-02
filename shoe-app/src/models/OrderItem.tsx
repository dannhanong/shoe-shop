import { Order } from "./Order";
import { Variant } from "./Variant";

export interface orderItem {
    id: number;
    order: Order;
    productVariant: Variant;
    quantity: number;
    itemPrice: number;
}