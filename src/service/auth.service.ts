import bcrypt from "bcrypt";
import {
    createAccount,
    deleteAccount,
    findAllAccounts,
    getAccountById,
    getAccountByVerificationToken,
    getAccountByEmail,
    getMultipleAccounts,
    getAccountByRefreshToken,
} from "../database/dao/account.dao";
import { getRefreshTokenByToken } from "../database/dao/refreshToken.dao";
import { createResetToken, deleteResetTokenByModel, getAllResetTokensForAccount, getResetTokenByToken } from "../database/dao/resetToken.dao";
import { Account } from "../database/models/Account";
import { RefreshToken } from "../database/models/RefreshToken";
import { ResetToken } from "../database/models/ResetToken";
import { Role } from "../enum/role.enum";
import { IAccount } from "../interface/Account.interface";
import AccountUtil from "../util/accountUtil";
import EmailService from "./email.service";

class AuthService {
    accountUtil = new AccountUtil();
    constructor(private emailService: EmailService) {}

    public async authenticate(email: string, password: string, ipAddress: string) {
        const acct: Account[] = await getAccountByEmail(email);
        const account = this.accountUtil.convertAccountModelToInterface(acct[0]);

        // authentication successful so generate jwt and refresh tokens
        const jwtToken = this.accountUtil.generateJwtToken(account);
        const refreshToken: RefreshToken = await this.accountUtil.generateRefreshToken(account, ipAddress);

        // save refresh token
        await refreshToken.save();

        // return basic details and tokens
        return {
            ...this.basicDetails(account),
            jwtToken,
            refreshToken: refreshToken.token,
        };
    }

    public async register(params: any, origin: string) {
        // "what's in params?" => consult registerUserSchema
        if (await getAccountByEmail(params.email)) {
            // send already registered error in email to prevent account enumeration
            return await this.emailService.sendAlreadyRegisteredEmail(params.email, origin);
        }

        // create account object
        const acct: Account = await createAccount(params);

        // first registered account is an admin
        const allAccountsInSystem = await getMultipleAccounts(5);
        const isFirstAccount = allAccountsInSystem.count === 0;
        acct.role = isFirstAccount ? Role.Admin : Role.User;
        acct.verificationToken = this.accountUtil.randomTokenString();

        // hash password
        acct.passwordHash = this.accountUtil.hash(params.password);

        // save account
        await acct.save();

        // send email
        const account = this.accountUtil.convertAccountModelToInterface(acct);
        await this.emailService.sendVerificationEmail(account, origin);
    }

    public async refreshToken(token: string, ipAddress: string) {
        const refreshToken = await this.accountUtil.getRefreshToken(token);
        const acct: Account[] = await getAccountByRefreshToken(refreshToken);
        // todo: throw err if multiple accts found & report
        const account: IAccount = this.accountUtil.convertAccountModelToInterface(acct[0]);

        // replace old refresh token with a new one and save
        const newRefreshToken = await this.accountUtil.generateRefreshToken(account, ipAddress);
        refreshToken.revoked = Date.now();
        refreshToken.revokedByIp = ipAddress;
        refreshToken.replacedByToken = newRefreshToken.token;
        await refreshToken.save();
        await newRefreshToken.save();

        // generate new jwt
        const jwtToken = this.accountUtil.generateJwtToken(account);

        // return basic details and tokens
        return {
            ...this.basicDetails(account),
            jwtToken,
            refreshToken: newRefreshToken.token,
        };
    }

    public async revokeToken(token: string, ipAddress: string) {
        const refreshToken = await this.accountUtil.getRefreshToken(token);

        // revoke token and save
        refreshToken.revoked = Date.now();
        refreshToken.revokedByIp = ipAddress;
        await refreshToken.save();
    }

    public async verifyEmail(token: string) {
        const account = await getAccountByVerificationToken(token);

        if (!account) throw "Verification failed";

        account.verified = Date.now();
        account.verificationToken = ""; // string value that is closest to 'undefined'
        await account.save();
    }

    public async forgotPassword(email: string, origin: string) {
        const acctArr: Account[] = await getAccountByEmail(email);
        if (acctArr.length > 1) {
            throw "More than one account found for this email";
            // todo: error logging
        }
        const acct = acctArr[0];

        // always return ok response to prevent email enumeration
        if (!acct) return;

        // create reset token that expires after 24 hours
        // todo: add reset token to reset token table linked to user
        const token = this.accountUtil.randomTokenString();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        createResetToken(acct.id, token, expires);

        // send email
        const account = this.accountUtil.convertAccountModelToInterface(acct);
        await this.emailService.sendPasswordResetEmail(account, origin);
    }

    public async validateResetToken(token: string) {
        const resetToken: ResetToken | null = await getResetTokenByToken(token);
        if (!resetToken) throw "Invalid token";
        const account = await getAccountById(resetToken.accountId);

        if (!account) throw "Invalid token";
    }

    public async resetPassword(token: string, password: string) {
        const resetToken: ResetToken | null = await getResetTokenByToken(token);
        if (!resetToken) throw "Invalid token";
        const account = await getAccountById(resetToken.accountId);

        if (!account) throw "Invalid token";

        // update password and remove reset token
        account.passwordHash = this.accountUtil.hash(password);
        account.passwordReset = Date.now();
        // account.resetToken = undefined;
        const resetTokenForAccount = await getAllResetTokensForAccount(account.id);
        for (const token of resetTokenForAccount) {
            deleteResetTokenByModel(token);
        }
        await account.save();
    }

    // authorized

    public async getAllAccounts() {
        const accounts: Account[] = await findAllAccounts();
        return accounts.map((a: Account) => this.basicDetails(a));
    }

    public async getAccountById(id: number) {
        const account: Account = await this.getAccount(id);
        return this.basicDetails(account);
    }

    public async createAccount(params: any) {
        // "what's in params?" => consult registerUserSchema
        // validate
        if (await getAccountByEmail(params.email)) {
            throw 'Email "' + params.email + '" is already registered';
        }

        const account: Account = await createAccount(params);
        account.verified = Date.now();

        // hash password
        account.passwordHash = this.accountUtil.hash(params.password);

        // save account
        await account.save();

        return this.basicDetails(account);
    }

    public async updateAccount(id: number, params: any) {
        const account = await this.getAccount(id);

        // validate (if email was changed)
        if (params.email && account.email !== params.email && (await getAccountByEmail(params.email))) {
            throw 'Email "' + params.email + '" is already taken';
        }

        // hash password if it was entered
        if (params.password) {
            params.passwordHash = this.accountUtil.hash(params.password);
        }

        // copy params to account and save
        Object.assign(account, params);
        account.updated = Date.now();
        await account.save();

        return this.basicDetails(account);
    }

    public async deleteAccount(id: string) {
        await this.deleteAccount(id);
    }

    private basicDetails(account: IAccount | Account) {
        const { id, email, role, updated, isVerified } = account;
        return { id, email, role, updated, isVerified };
    }

    private async getAccount(id: number) {
        const account = await getAccountById(id);
        if (!account) throw "Account not found";
        return account;
    }
}

export default AuthService;
