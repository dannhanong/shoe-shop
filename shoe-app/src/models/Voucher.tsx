export interface Voucher {
    id: number;
    code: string; // Mã voucher mà người dùng nhập vào
    discountAmount: number; // Số tiền hoặc phần trăm giảm giá
    maxUsage: number;
    startDate: string;
    endDate: string;
    active: boolean;
    percentage: boolean;
    used: boolean;
}