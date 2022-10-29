import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { IAccount } from "../interface/Account.interface";
import RefreshTokenDAO from "../database/dao/refreshToken.dao";
import { IRefreshToken } from "../interface/RefreshToken.interface";
import { Account, AccountCreationAttributes } from "../database/models/Account";
import { Role } from "../enum/role.enum";
import { RefreshToken } from "../database/models/RefreshToken";
import { IRegistrationDetails } from "../interface/RegistrationDetails.interface";

const secret: string = process.env.SECRET !== undefined ? process.env.SECRET : "YOLO";
if (secret === "YOLO") {
    throw new Error("secret not found in env file");
}

class AccountUtil {
    private refreshTokenDAO: RefreshTokenDAO;
    constructor() {
        this.refreshTokenDAO = new RefreshTokenDAO();
    }

    public randomTokenString() {
        return crypto.randomBytes(40).toString("hex");
    }

    public hash(password: string) {
        return bcrypt.hashSync(password, 10);
    }

    public async getRefreshTokenByTokenString(tokenString: string): Promise<RefreshToken> {
        const refreshToken = await this.refreshTokenDAO.getRefreshTokenByTokenString(tokenString);
        // fixme: .populate("account"); does what? see line 64         const { account } = refreshToken;
        if (!refreshToken || !refreshToken.isActive) throw new Error("Invalid token");
        return refreshToken;
    }

    public generateJwtToken(account: IAccount) {
        // create a jwt token containing the account id that expires in 15 minutes
        return jwt.sign({ sub: account.acctId, id: account.acctId }, secret, { expiresIn: "15m" });
    }

    public async generateRefreshToken(account: IAccount, ipAddress: string): Promise<RefreshToken> {
        // create a refresh token that expires in 7 days
        const accountId = account.acctId;
        const token = this.randomTokenString();
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const createdByIp = ipAddress;
        console.log("GenerateRefreshToken 49rm");
        return await this.refreshTokenDAO.createRefreshToken(accountId, token, expires, createdByIp);
    }

    public async generatePasswordHash(password: string): Promise<string> {
        // console.log(password, "password 53rm");
        const hash = await bcrypt.hash(password, 10);
        return hash;
    }

    public async attachMissingDetails(params: IRegistrationDetails): Promise<AccountCreationAttributes> {
        const start: any = { ...params };
        const pwHash: string = await this.generatePasswordHash(start.password);
        // start.acctId = 0; // fixme: shouldnt this be an autoincrement value?
        start.passwordHash = pwHash;
        start.verificationToken = "";
        // start.verified = 0;
        start.updated = 0;
        start.role = Role.User;
        const populated = { ...start } as AccountCreationAttributes;
        return populated;
    }

    public convertAccountModelToInterface(startAccount: Account): IAccount {
        if (startAccount.role !== Role.Admin && startAccount.role !== Role.User) {
            throw Error("No valid role found for user. Value was: " + startAccount.role);
        }
        const account: IAccount = {
            acctId: startAccount.acctId,
            email: startAccount.email,
            isVerified: startAccount.isVerified,
            updated: new Date(startAccount.updated),
            role: startAccount.role as Role,
            passwordHash: startAccount.passwordHash,
            verificationToken: startAccount.verificationToken,
        };
        if (account.passwordHash === undefined) {
            throw Error("No hashed password found");
        }
        return account;
    }
}
export default AccountUtil;
