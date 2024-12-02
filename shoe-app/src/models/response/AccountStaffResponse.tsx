export interface AccountStaffResponse {
    id: number;
    name: string;
    username: string;
    enabled: boolean;
    verificationCode: string;
    resetPasswordToken: string;
    email: string;
    phoneNumber: string;
    avatarCode: string;
    status: boolean;
  
    staffName: string;
    staffPhoneNumber: string;
    staffDob: string;
    staffAddress: string;
    staffGender: string;
    staffCccd: string;
    staffImageCode: string;
    staffStatus: boolean;
  }