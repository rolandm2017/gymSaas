import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { IAccount } from "../interface/Account.interface";
import { createRefreshToken, getRefreshTokenByToken } from "../database/dao/refreshToken.dao";
import { IRefreshToken } from "../interface/RefreshToken.interface";
import { Account } from "../database/models/Account";
import { Role } from "../enum/role.enum";

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

    public convertAccountModelToInterface(startAccount: Account): IAccount {
        if (startAccount.role !== Role.Admin && startAccount.role !== Role.User) {
            throw Error("No valid role found for user. Value was: " + startAccount.role);
        }
        const account: IAccount = {
            id: startAccount.id,
            email: startAccount.email,
            isVerified: startAccount.isVerified,
            updated: new Date(startAccount.updated),
            role: startAccount.role,
            passwordHash: startAccount.passwordHash,
        };
        if (account.passwordHash === undefined) {
            throw Error("No hashed password found");
        }
        return account;
    }
}
export default AccountUtil;
