import { orderItem } from "./OrderItem";
import { User } from "./User";

export interface Order {
  id: number;
  user: User | null;
  staff: User | null;
  orderType: string;
  paymentType: string;
  address: string | null;
  orderTime: string;
  totalDiscount: number | null;
  totalPrice: number;
  status: string;
  orderItems: orderItem[];
  paid: boolean;
  discountAmount: number | null;
  discountDetails: string | null;
  createdAt: string;
  paymentTime: string | null;
}