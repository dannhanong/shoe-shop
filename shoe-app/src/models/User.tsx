import { Role } from "./Role";

export interface User {
    id: number;
    name: string;
    username: string;
    password: string;
    enabled: boolean;
    email: string;
    phoneNumber: string;
    roles: Role[];
    avatarCode: string;
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
}