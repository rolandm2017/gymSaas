import { Account } from "../models/Account";
import { RefreshToken, RefreshTokenCreationAttributes } from "../models/RefreshToken";
import AccountDAO from "./account.dao";

class RefreshTokenDAO {
    private accountDAO: AccountDAO;
    constructor() {
        this.accountDAO = new AccountDAO();
    }
    public getRefreshTokenByToken = (token: string) => {
        return RefreshToken.findOne({
            where: {
                token,
            },
        });
    };

    public getAllRefreshTokensForAccount = (accountId: number) => {
        return RefreshToken.findAll({
            where: { "$Account.id$": accountId },
            include: [{ model: Account, as: Account.tableName }],
            // read: https://stackoverflow.com/questions/74092426/proper-way-to-find-an-account-via-one-of-its-associated-refreshtokens-in-sequeli
        });
    };

    public createRefreshToken = async (id: number, token: string, expires: Date, createdByIp: string) => {
        const associatedAcct: Account | null = await this.accountDAO.getAccountById(id);
        if (associatedAcct === null) throw Error("Account not found");
        const rt: RefreshToken = await RefreshToken.create({
            token,
            expires,
            createdByIp,
            isActive: true,
        });
        console.log(rt, "38rm");
        // associatedAcct.addRefreshToken(rt);
        rt.setAccount(associatedAcct);
        console.log("account set", "40rm");
        return rt;
    };
}

export default RefreshTokenDAO;
