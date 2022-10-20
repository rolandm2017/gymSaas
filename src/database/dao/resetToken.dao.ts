import { ResetToken, ResetTokenCreationAttributes } from "../models/ResetToken";

class ResetTokenDAO {
    constructor() {}
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
                accountId: accountId,
            },
        });
    };

    public createResetToken = (id: number, token: string, expires: Date) => {
        return ResetToken.create({ accountId: id, token, expires });
    };

    public deleteResetTokenById = (accountId: number) => {
        return ResetToken.destroy({ where: { accountId: accountId } });
    };

    public deleteResetTokenByModel = (resetToken: ResetToken) => {
        return resetToken.destroy();
    };
}

export default ResetTokenDAO;
