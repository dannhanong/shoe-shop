import { OrderProductCreation } from "./OrderProductCreation";

export interface OrderCreationByStaff {
    customerId?: number;
    orderProductCreations: OrderProductCreation[];
    voucherCode?: string;
    orderType: string;
    paymentType: string;
    address: string;
}