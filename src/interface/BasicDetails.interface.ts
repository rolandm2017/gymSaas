import { Role } from "../enum/role.enum";

export interface IBasicDetails {
    acctId: number;
    email: string;
    isVerified: boolean | null;
    updated: Date | number | null; // Date or number repping time
    role: Role;
    credits: number;
    created?: Date;
    jwtToken?: string;
    refreshToken?: string;
}
