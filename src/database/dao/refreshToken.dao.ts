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

    public getRefreshTokenById = async (tokenId: number) => {
        return await RefreshToken.findOne({
            where: {
                tokenId: tokenId,
            },
        });
    };

    public getRefreshTokenByTokenString = async (tokenString: string) => {
        return await RefreshToken.findOne({
            where: {
                token: tokenString,
            },
        });
    };

    public getAllRefreshTokensForAccount = async (accountId: number) => {
        return await RefreshToken.findAll({
            where: { acctId: accountId },
            include: "belongs_to_user",
        });
    };
}

export default RefreshTokenDAO;
