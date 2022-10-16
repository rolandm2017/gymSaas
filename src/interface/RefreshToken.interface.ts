export interface IRefreshToken {
    accountId: string;
    token: string;
    expires: Date;
    isActive: boolean;
}
