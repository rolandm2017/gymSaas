import { Account, AccountCreationAttributes } from "../models/Account";

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
