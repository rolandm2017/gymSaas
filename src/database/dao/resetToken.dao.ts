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

    public createResetToken = async (acctId: number, token: string, expires: Date) => {
        return await ResetToken.create({ acctId: acctId, token: token, expires: expires });
    };

    public getResetTokenByEmail = async (email: string) => {
        const acct = await this.acctDAO.getAccountByEmail(email);
        return await ResetToken.findOne({ where: { acctId: acct[0].acctId } });
    };
    public getResetTokenByToken = async (token: string) => {
        return await ResetToken.findOne({
            where: {
                token,
            },
        });
    };

    public getAllResetTokensForAccount = async (accountId: number) => {
        return await ResetToken.findAll({
            where: {
                acctId: accountId,
            },
        });
    };

    public getAllResetTokens = async () => {
        return await ResetToken.findAll({ where: {} });
    };

    public deleteResetTokenById = async (tokenId: number) => {
        return await ResetToken.destroy({ where: { tokenId: tokenId } });
    };

    public deleteResetTokenByModel = async (resetToken: ResetToken) => {
        return await resetToken.destroy();
    };
}

export default ResetTokenDAO;
