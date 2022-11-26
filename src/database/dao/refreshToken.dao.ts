import { RefreshToken, RefreshTokenCreationAttributes } from "../models/RefreshToken";

class RefreshTokenDAO {
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
}

export default RefreshTokenDAO;
