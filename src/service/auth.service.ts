import bcrypt from "bcrypt";
import AccountDAO from "../database/dao/account.dao";
import RefreshTokenDAO from "../database/dao/refreshToken.dao";
import ResetTokenDAO from "../database/dao/resetToken.dao";
import { Account } from "../database/models/Account";
import { RefreshToken } from "../database/models/RefreshToken";
import { ResetToken } from "../database/models/ResetToken";
import { Role } from "../enum/role.enum";
import { IAccount } from "../interface/Account.interface";
import { IBasicDetails } from "../interface/BasicDetails.interface";
import { IRegistrationDetails } from "../interface/RegistrationDetails.interface";
import { UserFromGoogle } from "../interface/UserFromGoogle.interface";
import AccountUtil from "../util/accountUtil";
import EmailService from "./email.service";

class AuthService {
    private accountUtil: AccountUtil;
    private accountDAO: AccountDAO;
    private resetTokenDAO: ResetTokenDAO;
    private emailService: EmailService;
    private refreshTokenDAO: RefreshTokenDAO;
    constructor(
        emailService: EmailService,
        accountUtil: AccountUtil,
        accountDAO: AccountDAO,
        resetTokenDAO: ResetTokenDAO,
        refreshTokenDAO: RefreshTokenDAO,
    ) {
        this.emailService = emailService;
        this.accountUtil = accountUtil;
        this.resetTokenDAO = resetTokenDAO;
        this.accountDAO = accountDAO;
        this.refreshTokenDAO = refreshTokenDAO;
    }

    public async grantRefreshToken(infoFromGoogle: UserFromGoogle, ipAddress: string): Promise<IBasicDetails> {
        // this method is used after the user logs in via google.
        // they are redirected to this callback URL, which receives their user details
        // and an ip address (probably one of google's).
        const accountEntry = await this.accountDAO.getAccountByGoogleId(infoFromGoogle.googleId);
        if (accountEntry === null) {
            throw new Error("Google SSO registration failed");
        }
        const account: IAccount = this.accountUtil.convertAccountModelToInterface(accountEntry);
        const randomChars = this.accountUtil.randomTokenString();
        const refreshToken: RefreshToken = await this.accountUtil.generateRefreshToken(account, ipAddress);
        // save refresh tokenm
        await refreshToken.save();
        return { ...this.basicDetails(account), refreshToken: refreshToken.token };
    }

    public async authenticate(email: string, password: string, ipAddress: string): Promise<IBasicDetails> {
        let acctArr: Account[] = await this.accountDAO.getAccountByEmail(email);
        if (acctArr.length === 0) throw new Error("No account found for this email");
        if (acctArr.length >= 2) throw new Error("More than one account found for this email");

        const acct = acctArr[0];
        const passwordIsCorrect = bcrypt.compareSync(password, acct.passwordHash);
        if (!acct || !acct.isVerified || !passwordIsCorrect) {
            throw new Error("Email or password is incorrect, or account is not verified");
        }
        const account: IAccount = this.accountUtil.convertAccountModelToInterface(acct);
        // authentication successful so generate jwt and refresh tokens
        const jwtToken: string = this.accountUtil.generateJwtToken(account);
        const refreshToken: RefreshToken = await this.accountUtil.generateRefreshToken(account, ipAddress);
        // save refresh tokenm
        await refreshToken.save();
        // return basic details and tokens
        return {
            ...this.basicDetails(account),
            jwtToken: jwtToken,
            refreshToken: refreshToken.token,
        };
    }

    public async register(params: IRegistrationDetails, origin: string): Promise<IBasicDetails> {
        const acctsWithThisEmail: Account[] = await this.accountDAO.getAccountByEmail(params.email);
        const emailAlreadyExists: boolean = acctsWithThisEmail.length !== 0;
        if (emailAlreadyExists) {
            // send already registered error in email to prevent account enumeration
            await this.emailService.sendAlreadyRegisteredEmail(params.email, origin);
            throw new Error("Account with this email already exists");
        }
        // create account object
        const acctWithPopulatedFields = await this.accountUtil.attachMissingDetails(params);
        const acct: Account = await this.accountDAO.createAccount(acctWithPopulatedFields);
        // acct has user role unless one is made by the 'make admin' endpoint in admin controller
        acct.role = Role.User;
        acct.verificationToken = this.accountUtil.randomTokenString();

        // hash password
        acct.passwordHash = this.accountUtil.hash(params.password);

        // save account
        await acct.save();

        // send email
        const account = this.accountUtil.convertAccountModelToInterface(acct);
        await this.emailService.sendVerificationEmail(account, origin);
        return {
            ...this.basicDetails(account),
        };
    }

    public async refreshToken(tokenString: string, ipAddress: string) {
        const refreshToken = await this.accountUtil.getRefreshTokenByTokenString(tokenString);
        const acct: Account[] = await this.accountDAO.getAccountByRefreshToken(refreshToken);
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

    public async userOwnsToken(acctId: number, submittedToken: string): Promise<boolean> {
        const refreshTokens = await this.refreshTokenDAO.getAllRefreshTokensForAccount(acctId);
        const userOwnsToken = refreshTokens.find((refreshToken: RefreshToken) => refreshToken.token === submittedToken) !== undefined;
        return userOwnsToken;
    }

    public async revokeToken(tokenString: string, ipAddress: string) {
        const refreshToken = await this.accountUtil.getRefreshTokenByTokenString(tokenString);
        // revoke token and save
        refreshToken.revoked = Date.now();
        refreshToken.revokedByIp = ipAddress;
        await refreshToken.save();
    }

    public async verifyEmail(token: string) {
        const account: Account | null = await this.accountDAO.getAccountByVerificationToken(token);
        if (account === null) throw new Error("Verification failed");

        account.verificationToken = ""; // string value that is closest to 'undefined'
        account.isVerified = true;
        await account.save();
    }

    public async updatePassword(email: string, oldPw: string, newPw: string) {
        const accountArr: Account[] = await this.accountDAO.getAccountByEmail(email);

        // always return ok response to prevent email enumeration
        if (accountArr.length === 0) return false;
        const account = accountArr[0];

        // check the starting passwords are the same
        const correctInputPw = bcrypt.compareSync(oldPw, account.passwordHash);
        if (!correctInputPw) return false;

        const hashed = this.accountUtil.hash(newPw);
        account.passwordHash = hashed;
        await account.save();
        return true;
    }

    public async forgotPassword(email: string, origin: string) {
        const acct: Account[] = await this.accountDAO.getAccountByEmail(email);

        // always return ok response to prevent email enumeration
        if (acct.length === 0) return;

        // create reset token that expires after 24 hours
        // todo: add reset token to reset token table linked to user
        const token = this.accountUtil.randomTokenString();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // we don't need to return anything here; rather it's added to the db so the user can submit the token in the next step
        await this.resetTokenDAO.createResetToken(acct[0].acctId, token, expires);
        // send email
        const account = this.accountUtil.convertAccountModelToInterface(acct[0]);
        account.resetToken = {
            token: token,
            expires: expires,
        };
        await this.emailService.sendPasswordResetEmail(account, origin);
    }

    public async validateResetToken(token: string) {
        const resetToken: ResetToken | null = await this.resetTokenDAO.getResetTokenByToken(token);
        if (!resetToken) return false;
        // throw new Error("Invalid token");
        const account = await this.accountDAO.getAccountById(resetToken.acctId);

        if (!account) return false;
        // throw new Error("Invalid token");
        return true;
    }

    public async resetPassword(token: string, password: string) {
        const resetToken: ResetToken | null = await this.resetTokenDAO.getResetTokenByToken(token);
        if (!resetToken) throw new Error("Invalid token");
        const account = await this.accountDAO.getAccountById(resetToken.acctId);
        if (!account) throw new Error("Invalid token");
        // update password and remove reset token
        account.passwordHash = this.accountUtil.hash(password);
        account.passwordReset = Date.now();
        const resetTokenForAccount = await this.resetTokenDAO.getAllResetTokensForAccount(account.acctId);
        for await (const token of resetTokenForAccount) {
            await this.resetTokenDAO.deleteResetTokenByModel(token);
        }
        await account.save();
        return true;
    }

    // authorized
    public async getAllAccounts() {
        const accounts: Account[] = await this.accountDAO.getAllAccounts();
        return accounts.map((a: Account) => this.basicDetails(a));
    }

    public async getAccountById(id: number) {
        const account: Account = await this.getAccount(id);
        return this.basicDetails(account);
    }

    public async createAccount(params: any) {
        // "what's in params?" => consult registerUserSchema
        // validate email
        if (await this.accountDAO.getAccountByEmail(params.email)) {
            throw 'Email "' + params.email + '" is already registered';
        }

        const account: Account = await this.accountDAO.createAccount(params);
        // account.verified = "";

        // hash password
        account.passwordHash = this.accountUtil.hash(params.password);

        // save account
        await account.save();

        return this.basicDetails(account);
    }

    public async updateAccount(id: number, params: any) {
        const account = await this.getAccount(id);

        // validate (if email was changed)
        if (params.email && account.email !== params.email && (await this.accountDAO.getAccountByEmail(params.email))) {
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

    private basicDetails(account: IAccount | Account): IBasicDetails {
        const { acctId, email, role, updated, isVerified } = account;
        const definitelyARole = role as Role;
        return { acctId, email, role: definitelyARole, updated, isVerified };
    }

    private async getAccount(id: number) {
        const account = await this.accountDAO.getAccountById(id);
        if (!account) throw new Error("Account not found");
        return account;
    }

    public async logVerificationToken(email: string) {
        const account = await this.accountDAO.getAccountByEmail(email);
        console.log("token for email" + email + " is " + account[0].verificationToken);
    }
}

export default AuthService;
