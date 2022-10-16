import { Role } from "../enum/role.enum";

export interface IAccount {
    id: string;
    email: string;
    role: Role;
    created: Date;
    updated: Date;
    isVerified: boolean;
    verificationToken?: string;
    passwordHash?: string;
    resetToken?: {
        token: string;
        expires: Date;
    };
}
