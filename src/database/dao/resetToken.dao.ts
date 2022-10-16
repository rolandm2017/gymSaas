import { ResetToken, ResetTokenCreationAttributes } from "../models/ResetToken";

export const getResetTokenByToken = (token: string) => {
    return ResetToken.findOne({
        where: {
            token,
        },
    });
};

export const getAllResetTokensForAccount = (accountId: number) => {
    return ResetToken.findAll({
        where: {
            accountId: accountId,
        },
    });
};

export const createResetToken = (id: number, token: string, expires: Date) => {
    return ResetToken.create({ accountId: id, token, expires });
};

export const deleteResetTokenById = (accountId: number) => {
    return ResetToken.destroy({ where: { accountId: accountId } });
};

export const deleteResetTokenByModel = (resetToken: ResetToken) => {
    return resetToken.destroy();
};
