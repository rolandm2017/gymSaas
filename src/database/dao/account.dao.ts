import { isEmail } from "../../validationSchemas/schemas";
import { Account, AccountCreationAttributes } from "../models/Account";
import { RefreshToken } from "../models/RefreshToken";

class AccountDAO {
    constructor() {}

    public findAllAccounts = () => {
        // 'find' instead of 'get' because 'getAllAccounts' is taken
        return Account.findAll();
    };

    public findAllAccountsWithTokens = () => {
        return Account.findAll({ include: "their_refresh_tokens" });
    };

    public getMultipleAccounts = async (limit: number, offset?: number) => {
        const accts: {
            rows: Account[];
            count: number;
        } = await Account.findAndCountAll({ offset, limit });
        return accts;
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
        return acct;
    };

    public getAccountByRefreshToken = (token: RefreshToken) => {
        // not wroking? read: https://stackoverflow.com/questions/74092426/proper-way-to-find-an-account-via-one-of-its-associated-refreshtokens-in-sequeli
        return Account.findAll({
            where: { "$RefreshTokens.token$": token.token },
            include: "their_refresh_tokens",
        });
    };

    public getAccountByVerificationToken = (token: string) => {
        return Account.findOne({ where: { verificationToken: token } });
    };

    public createAccount = async (account: AccountCreationAttributes) => {
        const isReallyEmail = isEmail(account.email);
        if (!isReallyEmail) throw new Error("Email field wasn't an email");
        const created: Account = await Account.create(account);
        return created;
    };

    public updateAccount = (account: AccountCreationAttributes, id: number) => {
        return Account.update(account, { where: { acctId: id } });
    };

    public deleteAccount = (id: number) => {
        return Account.destroy({ where: { acctId: id } });
    };
}

export default AccountDAO;
