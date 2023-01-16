import { Role } from "../enum/role.enum";

export interface IAccount {
    acctId: number;
    email: string;
    isVerified: boolean;
    updated: Date | number; // Date or number repping time
    role: Role;
    credits: number;
    created?: Date;
    verificationToken?: string;
    passwordHash?: string;
    passwordReset?: number; // Date.now()
    jwtToken?: string;
    refreshToken?: string;
    resetToken?: {
        tokenId?: number;
        token: string;
        expires: Date;
    };
}
