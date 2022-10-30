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
import { ISmallError } from "../interface/SmallError.interface";
import AccountUtil from "../util/accountUtil";
import EmailService from "./email.service";

class AuthService {
    private accountUtil: AccountUtil;
    private accountDAO: AccountDAO;
    private resetTokenDAO: ResetTokenDAO;
    private emailService: EmailService;
    constructor(e: EmailService, a: AccountUtil, accountDAO: AccountDAO, resetTokenDAO: ResetTokenDAO) {
        this.emailService = e;
        this.accountUtil = a;
        this.resetTokenDAO = resetTokenDAO;
        this.accountDAO = accountDAO;
    }

    public async authenticate(email: string, password: string, ipAddress: string): Promise<IBasicDetails | ISmallError> {
        console.log(email, "29rm");
        let acctArr: Account[] = await this.accountDAO.getAccountByEmail(email);
        if (acctArr.length === 0) return { error: "No account found for this email" };
        if (acctArr.length >= 2) return { error: "More than one account found for this email" };

        const acct = acctArr[0];
        // console.log(acct, "34rm");
        const passwordIsCorrect = bcrypt.compareSync(password, acct.passwordHash);
        console.log(passwordIsCorrect, "37rm");
        if (!acct || !acct.isVerified || !passwordIsCorrect) {
            console.log("in the throw, 39rm");
            throw new Error("Email or password is incorrect, or account is not verified");
        }
        console.log("39rm");
        const account: IAccount = this.accountUtil.convertAccountModelToInterface(acct);
        console.log(account, "40rm");
        // authentication successful so generate jwt and refresh tokens
        const jwtToken: string = this.accountUtil.generateJwtToken(account);
        console.log(jwtToken, "47rm");
        const refreshToken: RefreshToken = await this.accountUtil.generateRefreshToken(account, ipAddress);
        console.log(refreshToken, "49rm");
        // save refresh tokenm
        await refreshToken.save();

        // return basic details and tokens
        return {
            ...this.basicDetails(account),
            jwtToken,
            refreshToken: refreshToken.token,
        };
    }

    public async register(params: IRegistrationDetails, origin: string): Promise<IBasicDetails | ISmallError> {
        const acctsWithThisEmail: Account[] = await this.accountDAO.getAccountByEmail(params.email);
        const emailAlreadyExists: boolean = acctsWithThisEmail.length !== 0;
        if (emailAlreadyExists) {
            // send already registered error in email to prevent account enumeration
            await this.emailService.sendAlreadyRegisteredEmail(params.email, origin);
            return { error: "Account with this email already exists" };
        }
        // create account object
        const acctWithPopulatedFields = await this.accountUtil.attachMissingDetails(params);
        const acct: Account = await this.accountDAO.createAccount(acctWithPopulatedFields);
        // first registered account is an admin
        const allAccountsInSystem = await this.accountDAO.getMultipleAccounts(5);
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

    public async revokeToken(tokenString: string, ipAddress: string) {
        const refreshToken = await this.accountUtil.getRefreshTokenByTokenString(tokenString);
        // revoke token and save
        refreshToken.revoked = Date.now();
        refreshToken.revokedByIp = ipAddress;
        await refreshToken.save();
    }

    public async verifyEmail(token: string) {
        const account: Account | null = await this.accountDAO.getAccountByVerificationToken(token);
        console.log(token, account, "122rm");
        if (account === null) throw new Error("Verification failed");

        // const now = new Date().toISOString();
        // console.log(now, "126rm");
        // account.verified = now;
        // account.verified = 1000; // temp -- test
        account.verificationToken = ""; // string value that is closest to 'undefined'
        account.isVerified = true;
        console.log(account, "126rm");
        await account.save();
        console.log("129rm");
    }

    public async updatePassword(email: string, oldPw: string, newPw: string) {
        console.log(email, "142rm");
        const accountArr: Account[] = await this.accountDAO.getAccountByEmail(email);

        // always return ok response to prevent email enumeration
        if (accountArr.length === 0) return false;
        const account = accountArr[0];

        console.log("149rm");
        // check the starting passwords are the same
        const correctInputPw = bcrypt.compareSync(oldPw, account.passwordHash);
        if (!correctInputPw) return false;

        const hashed = this.accountUtil.hash(newPw);
        account.passwordHash = hashed;
        await account.save();
        console.log("157rm");
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
        if (!resetToken) throw new Error("Invalid token");
        const account = await this.accountDAO.getAccountById(resetToken.accountId);

        if (!account) throw new Error("Invalid token");
    }

    public async resetPassword(token: string, password: string) {
        const resetToken: ResetToken | null = await this.resetTokenDAO.getResetTokenByToken(token);
        if (!resetToken) throw new Error("Invalid token");
        const account = await this.accountDAO.getAccountById(resetToken.accountId);

        if (!account) throw new Error("Invalid token");

        // update password and remove reset token
        account.passwordHash = this.accountUtil.hash(password);
        account.passwordReset = Date.now();
        // account.resetToken = undefined;
        const resetTokenForAccount = await this.resetTokenDAO.getAllResetTokensForAccount(account.acctId);
        for (const token of resetTokenForAccount) {
            this.resetTokenDAO.deleteResetTokenByModel(token);
        }
        await account.save();
    }

    // authorized

    public async getAllAccounts() {
        const accounts: Account[] = await this.accountDAO.findAllAccounts();
        return accounts.map((a: Account) => this.basicDetails(a));
    }

    public async getAccountById(id: number) {
        const account: Account = await this.getAccount(id);
        return this.basicDetails(account);
    }

    public async createAccount(params: any) {
        // "what's in params?" => consult registerUserSchema
        // validate
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
}

export default AuthService;
