import { Account, AccountCreationAttributes } from "../models/Account";
import { RefreshToken } from "../models/RefreshToken";

export const findAllAccounts = () => {
    // 'find' instead of 'get' because 'getAllAccounts' is taken
    return Account.findAll();
};

export const getMultipleAccounts = (limit: number, offset?: number) => {
    return Account.findAndCountAll({ offset, limit });
};

export const getAccountById = (id: number) => {
    return Account.findByPk(id);
};

export const getAccountByEmail = (email: string) => {
    return Account.findAll({
        where: { email },
    });
};

export const getAccountByRefreshToken = (token: RefreshToken) => {
    return Account.findAll({
        where: { "$RefreshTokens.token$": token.token },
        include: {
            model: RefreshToken,
            as: RefreshToken.tableName,
        },
    });
};

export const getAccountByVerificationToken = (token: string) => {
    return Account.findOne({ where: { verificationToken: token } });
};

export const createAccount = (account: AccountCreationAttributes) => {
    return Account.create(account);
};

export const updateAccount = (account: AccountCreationAttributes, id: number) => {
    return Account.update(account, { where: { id } });
};

export const deleteAccount = (id: number) => {
    return Account.destroy({ where: { id } });
};
