import { isEmail } from "../../validationSchemas/schemas";
import { Account, AccountCreationAttributes } from "../models/Account";
import { RefreshToken } from "../models/RefreshToken";

class AccountDAO {
    constructor() {}

    public findAllAccounts = () => {
        // 'find' instead of 'get' because 'getAllAccounts' is taken
        return Account.findAll();
    };

    public getMultipleAccounts = (limit: number, offset?: number) => {
        return Account.findAndCountAll({ offset, limit });
    };

    public getAccountById = (id: number) => {
        return Account.findByPk(id);
    };

    public getAccountByEmail = async (email: string) => {
        const isReallyEmail = isEmail(email);
        if (!isReallyEmail) throw new Error("Email field wasn't an email");
        const acct: Account[] = await Account.findAll({
            where: { email: email },
        });
        console.log(acct.length + " accounts found");
        return acct;
    };

    public getAccountByRefreshToken = (token: RefreshToken) => {
        // not wroking? read: https://stackoverflow.com/questions/74092426/proper-way-to-find-an-account-via-one-of-its-associated-refreshtokens-in-sequeli
        return Account.findAll({
            where: { "$RefreshTokens.token$": token.token },
            include: {
                model: RefreshToken,
                as: RefreshToken.tableName,
            },
        });
    };

    public getAccountByVerificationToken = (token: string) => {
        return Account.findOne({ where: { verificationToken: token } });
    };

    public createAccount = (account: AccountCreationAttributes) => {
        const isReallyEmail = isEmail(account.email);
        console.log(account.email, isReallyEmail, "48rm");
        console.log(account, "49rm");
        if (!isReallyEmail) throw new Error("Email field wasn't an email");
        return Account.create(account);
    };

    public updateAccount = (account: AccountCreationAttributes, id: number) => {
        return Account.update(account, { where: { id } });
    };

    public deleteAccount = (id: number) => {
        return Account.destroy({ where: { id } });
    };
}

export default AccountDAO;
