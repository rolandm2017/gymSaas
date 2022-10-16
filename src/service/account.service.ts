import bcrypt from "bcrypt";
import { deleteAccount, getByEmail } from "../database/dao/account.dao";
import { Account } from "../database/models/Account";
import { Role } from "../enum/role.enum";
import { IAccount } from "../interface/Account.interface";
import AccountUtil from "../util/accountUtil";
import EmailService from "./email.service";

class AccountService {
    accountUtil = new AccountUtil();
    constructor(private emailService: EmailService) {}

    public async authenticate(email: string, password: string, ipAddress: string) {
        const account: Account[] = await getByEmail(email);

        if (!account || !account.isVerified || !bcrypt.compareSync(password, account.passwordHash)) {
            throw "Email or password is incorrect";
        }

        // authentication successful so generate jwt and refresh tokens
        const jwtToken = this.accountUtil.generateJwtToken(account);
        const refreshToken = this.accountUtil.generateRefreshToken(account, ipAddress);

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
        if (await db.Account.findOne({ email: params.email })) {
            // send already registered error in email to prevent account enumeration
            return await this.emailService.sendAlreadyRegisteredEmail(params.email, origin);
        }

        // create account object
        const account = new db.Account(params);

        // first registered account is an admin
        const isFirstAccount = (await db.Account.countDocuments({})) === 0;
        account.role = isFirstAccount ? Role.Admin : Role.User;
        account.verificationToken = this.accountUtil.randomTokenString();

        // hash password
        account.passwordHash = this.accountUtil.hash(params.password);

        // save account
        await account.save();

        // send email
        await this.emailService.sendVerificationEmail(account, origin);
    }

    public async refreshToken(token: string, ipAddress: string) {
        const refreshToken = await this.accountUtil.getRefreshToken(token);
        const { account } = refreshToken;

        // replace old refresh token with a new one and save
        const newRefreshToken = this.accountUtil.generateRefreshToken(account, ipAddress);
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
        const account = await db.Account.findOne({ verificationToken: token });

        if (!account) throw "Verification failed";

        account.verified = Date.now();
        account.verificationToken = undefined;
        await account.save();
    }

    public async forgotPassword(email: string, origin: string) {
        const account = await db.Account.findOne({ email });

        // always return ok response to prevent email enumeration
        if (!account) return;

        // create reset token that expires after 24 hours
        account.resetToken = {
            token: this.accountUtil.randomTokenString(),
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
        await account.save();

        // send email
        await this.emailService.sendPasswordResetEmail(account, origin);
    }

    public async validateResetToken(token: string) {
        const account = await db.Account.findOne({
            "resetToken.token": token,
            "resetToken.expires": { $gt: Date.now() },
        });

        if (!account) throw "Invalid token";
    }

    public async resetPassword(token: string, password: string) {
        const account = await db.Account.findOne({
            "resetToken.token": token,
            "resetToken.expires": { $gt: Date.now() },
        });

        if (!account) throw "Invalid token";

        // update password and remove reset token
        account.passwordHash = hash(password);
        account.passwordReset = Date.now();
        account.resetToken = undefined;
        await account.save();
    }

    // authorized

    public async getAllAccounts() {
        const accounts: IAccount[] = await db.Account.find();
        return accounts.map((a: IAccount) => this.basicDetails(a));
    }

    public async getAccountById(id: string) {
        const account: IAccount = await this.getAccount(id);
        return this.basicDetails(account);
    }

    public async createAccount(params: any) {
        // "what's in params?" => consult registerUserSchema
        // validate
        if (await db.Account.findOne({ email: params.email })) {
            throw 'Email "' + params.email + '" is already registered';
        }

        const account = new db.Account(params);
        account.verified = Date.now();

        // hash password
        account.passwordHash = this.accountUtil.hash(params.password);

        // save account
        await account.save();

        return this.basicDetails(account);
    }

    public async updateAccount(id: string, params: any) {
        const account = await this.getAccount(id);

        // validate (if email was changed)
        if (params.email && account.email !== params.email && (await db.Account.findOne({ email: params.email }))) {
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
        const account = await this.getAccount(id);
        await account.remove();
    }

    private basicDetails(account: IAccount) {
        const { id, title, firstName, lastName, email, role, created, updated, isVerified } = account;
        return { id, title, firstName, lastName, email, role, created, updated, isVerified };
    }

    private async getAccount(id: string) {
        if (!db.isValidId(id)) throw "Account not found";
        const account = await db.Account.findById(id);
        if (!account) throw "Account not found";
        return account;
    }
}

export default AccountService;
