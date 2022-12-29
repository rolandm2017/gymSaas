import { Role } from "../../enum/role.enum";
import { TryCatchClassDecorator } from "../../util/tryCatchClassDecorator";
import { isEmail } from "../../validationSchemas/userAuthSchemas";
import { Account, AccountCreationAttributes } from "../models/Account";
import { RefreshToken } from "../models/RefreshToken";

@TryCatchClassDecorator(Error, (err, context) => {
    console.log(context, err);
    throw err;
})
class AccountDAO {
    constructor() {}

    public async createAccount(account: AccountCreationAttributes): Promise<Account> {
        const isReallyEmail = isEmail(account.email);
        if (!isReallyEmail) throw new Error("Email field wasn't an email");
        const created: Account = await Account.create(account);
        return created;
    }

    public async createAdmin(email: string): Promise<number> {
        const affected = await Account.update({ role: Role.Admin }, { where: { email } });
        return affected[0];
    }

    public async countAdmins(): Promise<number> {
        const accounts = await Account.findAndCountAll({ where: { role: Role.Admin } });
        return accounts.count;
    }

    public async findAllAccounts(): Promise<Account[]> {
        // 'find' instead of 'get' because 'getAllAccounts' is taken
        return await Account.findAll();
    }

    public async findAllAccountsWithTokens(): Promise<Account[]> {
        return await Account.findAll({ include: "their_refresh_tokens" });
    }

    public async getMultipleAccounts(limit: number, offset?: number): Promise<{ rows: Account[]; count: number }> {
        const accts = await Account.findAndCountAll({ offset, limit });
        return accts;
    }

    public async getAccountById(id: number): Promise<Account | null> {
        return await Account.findByPk(id);
    }

    public async getAccountByEmail(email: string): Promise<Account[]> {
        const isReallyEmail = isEmail(email);
        if (!isReallyEmail) throw new Error("Email field wasn't an email");
        const acct: Account[] = await Account.findAll({
            where: { email: email },
        });
        return acct;
    }

    public async getAccountByRefreshToken(token: RefreshToken): Promise<Account[]> {
        return await Account.findAll({
            where: { acctId: token.token },
            include: "their_refresh_tokens",
        });
    }

    public async getAccountByVerificationToken(token: string): Promise<Account | null> {
        return await Account.findOne({ where: { verificationToken: token } });
    }

    public async banUser(userId: number): Promise<number> {
        const affected = await Account.update({ isBanned: true }, { where: { acctId: userId } });
        return affected[0];
    }

    public async updateAccount(account: AccountCreationAttributes, id: number): Promise<number> {
        const affected = await Account.update(account, { where: { acctId: id } });
        return affected[0];
    }

    public async deleteAccount(id: number): Promise<number> {
        const affected = await Account.destroy({ where: { acctId: id } });
        return affected;
    }
}

export default AccountDAO;
