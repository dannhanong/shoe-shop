export interface Discount {
    id: number;
    name: string;
    discountRate: number;
    startDate: string; 
    endDate: string; 
    description: string;
    status: boolean;
}