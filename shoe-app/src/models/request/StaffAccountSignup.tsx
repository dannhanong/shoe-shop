import { BaseStaffAccount } from "./BaseStaffAccount";

export interface StaffAccountSignup extends BaseStaffAccount {
  password: string;
  rePassword: string;
}