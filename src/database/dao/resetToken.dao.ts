import { ResetToken, ResetTokenCreationAttributes } from "../models/ResetToken";
import AccountDAO from "./account.dao";

class ResetTokenDAO {
    private acctDAO: AccountDAO;
    constructor(acctDAO: AccountDAO) {
        this.acctDAO = acctDAO;
    }

    public createResetToken = async (acctId: number, token: string, expires: Date) => {
        return await ResetToken.create({ acctId: acctId, token: token, expires: expires });
    };

    public getResetTokenByEmail = async (email: string) => {
        const acct = await this.acctDAO.getAccountByEmail(email);
        return await ResetToken.findOne({ where: { acctId: acct[0].acctId } });
    };
    public getResetTokenByToken = (token: string) => {
        return ResetToken.findOne({
            where: {
                token,
            },
        });
    };

    public getAllResetTokensForAccount = (accountId: number) => {
        return ResetToken.findAll({
            where: {
                acctId: accountId,
            },
        });
    };

    public getAllResetTokens = async () => {
        return await ResetToken.findAll({ where: {} });
    };

    public deleteResetTokenById = (tokenId: number) => {
        return ResetToken.destroy({ where: { tokenId: tokenId } });
    };

    public deleteResetTokenByModel = (resetToken: ResetToken) => {
        return resetToken.destroy();
    };
}

export default ResetTokenDAO;
