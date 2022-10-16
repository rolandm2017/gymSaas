import { RefreshToken, RefreshTokenCreationAttributes } from "../models/RefreshToken";

export const getRefreshTokenByToken = (token: string) => {
    return RefreshToken.findOne({
        where: {
            token,
        },
    });
};

export const getAllRefreshTokensForAccount = (accountId: number) => {
    return RefreshToken.findAll({
        where: {
            accountId: accountId,
        },
    });
};

export const createRefreshToken = (id: number, token: string, expires: Date, createdByIp: string) => {
    return RefreshToken.create({ accountId: id, token, expires, createdByIp, isActive: true });
};
