import { TryCatchClassDecorator } from "../../util/tryCatchClassDecorator";
import { RefreshToken, RefreshTokenCreationAttributes } from "../models/RefreshToken";

@TryCatchClassDecorator(Error, (err, context) => {
    console.log(context, err);
    throw err;
})
class RefreshTokenDAO {
    public async createRefreshToken(acctId: number, token: string, expires: Date, createdByIp: string) {
        const rt: RefreshToken = await RefreshToken.create({
            token,
            expires,
            createdByIp,
            isActive: true,
            acctId: acctId,
        });
        return rt;
    }

    public async getRefreshTokenById(tokenId: number) {
        return await RefreshToken.findOne({
            where: {
                tokenId: tokenId,
            },
        });
    }

    public async getRefreshTokenByTokenString(tokenString: string) {
        return await RefreshToken.findOne({
            where: {
                token: tokenString,
            },
        });
    }

    public async getAllRefreshTokensForAccount(accountId: number) {
        return await RefreshToken.findAll({
            where: { acctId: accountId },
            include: "belongs_to_user",
        });
    }
}

export default RefreshTokenDAO;
