export interface SeasonalDiscountCreation {
    name: string;
    discountRate: number;
    startDate: string; 
    endDate: string; 
    description: string;
    applicableProductIds: number[];
}