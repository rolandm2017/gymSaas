// import { Account, AccountCreationAttributes } from "../models/Account";

// export const getMultipleAccounts = (limit: number, offset?: number) => {
//     return Account.findAndCountAll({ offset, limit });
// };

// export const getAccountById = (id: number) => {
//     return Account.findByPk(id);
// };

export const getByToken = (token: string) => {
    return RefreshToken.find({
        where: {
            token,
        },
    });
};
// export const getByEmail = (email: string) => {
//     return Account.findOne({
//         where: { email },
//     });
// };

export const createRefreshToken = (id: string, token: string, expires: Date, createdByIp: string) => {
    return RefreshToken.create({ account, token, expires, createdByIp });
};

// export const updateAccount = (account: AccountCreationAttributes, id: number) => {
//     return Account.update(account, { where: { id } });
// };

// export const deleteAccount = (id: number) => {
//     return Account.destroy({ where: { id } });
// };
