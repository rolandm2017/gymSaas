import { Account } from "../models/Account";
import { RefreshToken, RefreshTokenCreationAttributes } from "../models/RefreshToken";
import AccountDAO from "./account.dao";

class RefreshTokenDAO {
    private accountDAO: AccountDAO;
    constructor() {
        this.accountDAO = new AccountDAO();
    }
    public getRefreshTokenById = (tokenId: number) => {
        return RefreshToken.findOne({
            where: {
                tokenId: tokenId,
            },
        });
    };

    public getRefreshTokenByTokenString = (tokenString: string) => {
        return RefreshToken.findOne({
            where: {
                token: tokenString,
            },
        });
    };

    public getAllRefreshTokensForAccount = (accountId: number) => {
        return RefreshToken.findAll({
            where: { acctId: accountId },
            include: "belongs_to_user",
        });
    };

    public createRefreshToken = async (acctId: number, token: string, expires: Date, createdByIp: string) => {
        const rt: RefreshToken = await RefreshToken.create({
            token,
            expires,
            createdByIp,
            isActive: true,
            acctId: acctId,
        });
        return rt;
    };
}

export default RefreshTokenDAO;
