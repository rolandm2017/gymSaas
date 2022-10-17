import { Account } from "../models/Account";
import { RefreshToken, RefreshTokenCreationAttributes } from "../models/RefreshToken";
import { getAccountById } from "./account.dao";

export const getRefreshTokenByToken = (token: string) => {
    return RefreshToken.findOne({
        where: {
            token,
        },
    });
};

export const getAllRefreshTokensForAccount = (accountId: number) => {
    return RefreshToken.findAll({
        where: { "$Account.id$": accountId },
        include: [{ model: Account, as: Account.tableName }],
    });
};

export const createRefreshToken = async (id: number, token: string, expires: Date, createdByIp: string) => {
    // todo: create rt associated w/ acct id of id
    const rt: RefreshToken = await RefreshToken.create({ token, expires, createdByIp, isActive: true });
    const associatedAcct: Account | null = await getAccountById(id);
    if (associatedAcct === null) throw Error("Account not found");
    rt.setAccount(associatedAcct); // fixme: p sure setAccount exists
};
