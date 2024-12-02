import { User } from "./User";

export interface Staff {
    id: number;
    name: string;
    phoneNumber: string;
    dob: string;
    address: string;
    gender: string;
    cccd: string;
    imageCode: string;
    status: boolean;
    user: User;
}