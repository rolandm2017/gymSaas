import { TryCatchClassDecorator } from "../../util/tryCatchClassDecorator";
import { ResetToken, ResetTokenCreationAttributes } from "../models/ResetToken";
import AccountDAO from "./account.dao";

@TryCatchClassDecorator(Error, (err, context) => {
    console.log(context, err);
    throw err;
})
class ResetTokenDAO {
    private acctDAO: AccountDAO;
    constructor(acctDAO: AccountDAO) {
        this.acctDAO = acctDAO;
    }

    public async createResetToken(acctId: number, token: string, expires: Date) {
        return await ResetToken.create({ acctId: acctId, token: token, expires: expires });
    }

    public async getResetTokenByEmail(email: string) {
        const acct = await this.acctDAO.getAccountByEmail(email);
        return await ResetToken.findOne({ where: { acctId: acct[0].acctId } });
    }
    public async getResetTokenByToken(token: string) {
        return await ResetToken.findOne({
            where: {
                token,
            },
        });
    }

    public async getAllResetTokensForAccount(accountId: number) {
        return await ResetToken.findAll({
            where: {
                acctId: accountId,
            },
        });
    }

    public async getAllResetTokens() {
        return await ResetToken.findAll({ where: {} });
    }

    public async deleteResetTokenById(tokenId: number) {
        return await ResetToken.destroy({ where: { tokenId: tokenId } });
    }

    public async deleteResetTokenByModel(resetToken: ResetToken) {
        return await resetToken.destroy();
    }
}

export default ResetTokenDAO;
