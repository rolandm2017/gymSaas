import { Role } from "../enum/role.enum";

export interface IAccount {
    id: number;
    email: string;
    isVerified: boolean;
    updated: Date;
    role: Role;
    created?: Date;
    verificationToken?: string;
    passwordHash?: string;
    passwordReset?: number; // Date.now()
    resetToken?: {
        token: string;
        expires: Date;
    };
}
