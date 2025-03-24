import { User } from "./User";

export interface Address {
    id: number;
    province: string;
    district: string;
    ward: string;
    street: string;
    user: User;
    primaryAddress: boolean;
}