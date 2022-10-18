import { Role } from "../enum/role.enum";

export interface IAccount {
    id: number;
    email: string;
    isVerified: boolean;
    updated: Date | number; // Date or number repping time
    role: Role;
    created?: Date;
    verificationToken?: string;
    passwordHash?: string;
    passwordReset?: number; // Date.now()
    jwtToken?: string;
    refreshToken?: string;
    resetToken?: {
        token: string;
        expires: Date;
    };
}