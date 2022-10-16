import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { IAccount } from "../interface/Account.interface";
import { createRefreshToken, getRefreshTokenByToken } from "../database/dao/refreshToken.dao";
import { IRefreshToken } from "../interface/RefreshToken.interface";

const secret: string = process.env.SECRET !== undefined ? process.env.SECRET : "YOLO";
if (secret === "YOLO") {
    throw new Error("secret not found in env file");
}

class AccountUtil {
    constructor() {}

    public randomTokenString() {
        return crypto.randomBytes(40).toString("hex");
    }

    public hash(password: string) {
        return bcrypt.hashSync(password, 10);
    }

    public async getRefreshToken(token: string) {
        const refreshToken = await getRefreshTokenByToken(token);
        // fixme: .populate("account"); does what? see line 64         const { account } = refreshToken;
        if (!refreshToken || !refreshToken.isActive) throw "Invalid token";
        return refreshToken;
    }

    public async generateJwtToken(account: IAccount) {
        // create a jwt token containing the account id that expires in 15 minutes
        return jwt.sign({ sub: account.id, id: account.id }, secret, { expiresIn: "15m" });
    }

    public async generateRefreshToken(account: IAccount, ipAddress: string) {
        // create a refresh token that expires in 7 days
        const accountId = account.id;
        const token = this.randomTokenString();
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const createdByIp = ipAddress;
        return createRefreshToken(accountId, token, expires, createdByIp);
    }
}
export default AccountUtil;
