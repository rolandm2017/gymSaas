import { Role } from "../enum/role.enum";

export interface IBasicDetails {
    acctId: number;
    email: string;
    isVerified: boolean;
    updated: Date | number; // Date or number repping time
    role: Role;
    created?: Date;
    jwtToken?: string;
    refreshToken?: string;
}
