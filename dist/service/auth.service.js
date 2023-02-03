"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
class AuthService {
    constructor(emailService, accountUtil, accountDAO, profileDAO, resetTokenDAO, refreshTokenDAO) {
        this.emailService = emailService;
        this.accountUtil = accountUtil;
        this.accountDAO = accountDAO;
        this.resetTokenDAO = resetTokenDAO;
        this.profileDAO = profileDAO;
        this.refreshTokenDAO = refreshTokenDAO;
    }
    grantRefreshToken(infoFromGoogle, ipAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            // this method is used after the user logs in via google.
            // they are redirected to this callback URL, which receives their user details
            // and an ip address (probably one of google's).
            const accountEntry = yield this.accountDAO.getAccountByGoogleId(infoFromGoogle.googleId);
            if (accountEntry === null) {
                throw new Error("Google SSO registration failed");
            }
            const account = this.accountUtil.convertAccountModelToInterface(accountEntry);
            const refreshToken = yield this.accountUtil.generateRefreshToken(account, ipAddress);
            // save refresh tokenm\
            yield refreshToken.save();
            return Object.assign(Object.assign({}, this.basicDetails(account)), { refreshToken: refreshToken.token });
        });
    }
    authenticate(email, password, ipAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            let acctArr = yield this.accountDAO.getAccountByEmail(email);
            if (acctArr.length === 0)
                throw new Error("No account found for this email");
            if (acctArr.length >= 2)
                throw new Error("More than one account found for this email");
            const acct = acctArr[0];
            const passwordIsCorrect = bcrypt_1.default.compareSync(password, acct.passwordHash);
            if (!acct.isVerified) {
                throw Error("Verify your account to log in");
            }
            if (!acct || !passwordIsCorrect) {
                throw new Error("Email or password is incorrect");
            }
            const account = this.accountUtil.convertAccountModelToInterface(acct);
            // authentication successful so generate jwt and refresh tokens
            const jwtToken = this.accountUtil.generateJwtToken(account);
            const refreshToken = yield this.accountUtil.generateRefreshToken(account, ipAddress);
            // save refresh tokenm
            yield refreshToken.save();
            // return basic details and tokens
            return Object.assign(Object.assign({}, this.basicDetails(account)), { jwtToken: jwtToken, refreshToken: refreshToken.token });
        });
    }
    register(params, ipAddr, origin) {
        return __awaiter(this, void 0, void 0, function* () {
            const acctsWithThisEmail = yield this.accountDAO.getAccountByEmail(params.email);
            const emailAlreadyExists = acctsWithThisEmail.length !== 0;
            if (emailAlreadyExists) {
                // send already registered error in email to prevent account enumeration
                yield this.emailService.sendAlreadyRegisteredEmail(params.email, acctsWithThisEmail[0].acctId);
                throw new Error("Account with this email already exists");
            }
            // create account object
            const acctWithPopulatedFields = yield this.accountUtil.attachMissingDetails(params, ipAddr);
            const acct = yield this.accountDAO.createAccount(acctWithPopulatedFields);
            acct.verificationToken = this.accountUtil.randomTokenString();
            // hash password
            acct.passwordHash = this.accountUtil.hash(params.password);
            // save account
            yield acct.save();
            // send email
            const account = this.accountUtil.convertAccountModelToInterface(acct);
            yield this.emailService.sendVerificationEmail(account, account.acctId);
            return Object.assign({}, this.basicDetails(account));
        });
    }
    createOrAssociateProfile(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountArr = yield this.accountDAO.getAccountByEmail(email);
            if (accountArr.length === 0)
                throw new Error("No account found for this email");
            if (accountArr.length >= 2)
                throw new Error("More than one account found for this email");
            const account = accountArr[0];
            const accountIp = account.ipAddress;
            const relatedProfile = yield this.profileDAO.getProfileByIp(accountIp);
            if (relatedProfile === null) {
                const created = yield this.profileDAO.createProfileByIp(accountIp);
                yield this.accountDAO.associateAccountWithProfile(account.acctId, created);
                return;
            }
            yield this.accountDAO.associateAccountWithProfile(account.acctId, relatedProfile);
            return;
        });
    }
    refreshToken(tokenString, ipAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const refreshToken = yield this.accountUtil.getRefreshTokenByTokenString(tokenString);
            // todo: kmChangeToLatlong
            const acct = yield this.accountDAO.getAccountByRefreshToken(refreshToken);
            const noAccountFound = acct == null;
            if (noAccountFound) {
                throw Error("No account found for refresh token"); // todo: log failure
            }
            const account = this.accountUtil.convertAccountModelToInterface(acct);
            // replace old refresh token with a new one and save
            const newRefreshToken = yield this.accountUtil.generateRefreshToken(account, ipAddress);
            refreshToken.revoked = new Date();
            refreshToken.revokedByIp = ipAddress;
            refreshToken.replacedByToken = newRefreshToken.token;
            yield refreshToken.save();
            yield newRefreshToken.save();
            // generate new jwt
            const jwtToken = this.accountUtil.generateJwtToken(account);
            // return basic details and tokens
            return Object.assign(Object.assign({}, this.basicDetails(account)), { jwtToken, refreshToken: newRefreshToken.token });
        });
    }
    userOwnsToken(acctId, submittedToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const refreshTokens = yield this.refreshTokenDAO.getAllRefreshTokensForAccount(acctId);
            const userOwnsToken = refreshTokens.find((refreshToken) => refreshToken.token === submittedToken) !== undefined;
            return userOwnsToken;
        });
    }
    revokeToken(tokenString, ipAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const refreshToken = yield this.accountUtil.getRefreshTokenByTokenString(tokenString);
            // revoke token and save
            refreshToken.revoked = new Date();
            refreshToken.revokedByIp = ipAddress;
            yield refreshToken.save();
        });
    }
    verifyEmail(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield this.accountDAO.getAccountByVerificationToken(token);
            if (account === null)
                throw new Error("Verification failed");
            account.verificationToken = ""; // string value that is closest to 'undefined'
            account.isVerified = true;
            yield account.save();
            return { success: true, accountEmail: account.email };
        });
    }
    updatePassword(email, oldPw, newPw) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountArr = yield this.accountDAO.getAccountByEmail(email);
            // always return ok response to prevent email enumeration
            if (accountArr.length === 0)
                return false;
            const account = accountArr[0];
            // check the starting passwords are the same
            const correctInputPw = bcrypt_1.default.compareSync(oldPw, account.passwordHash);
            if (!correctInputPw)
                return false;
            const hashed = this.accountUtil.hash(newPw);
            account.passwordHash = hashed;
            yield account.save();
            return true;
        });
    }
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const acct = yield this.accountDAO.getAccountByEmail(email);
            // always return ok response to prevent email enumeration
            if (acct.length === 0)
                return;
            // create reset token that expires after 24 hours
            const token = this.accountUtil.randomTokenString();
            const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
            // we don't need to return anything here; rather it's added to the db so the user can submit the token in the next step
            yield this.resetTokenDAO.createResetToken(acct[0].acctId, token, expires);
            // send email
            const account = this.accountUtil.convertAccountModelToInterface(acct[0]);
            account.resetToken = {
                token: token,
                expires: expires,
            };
            yield this.emailService.sendPasswordResetEmail(account, account.acctId);
        });
    }
    validateResetToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const resetToken = yield this.resetTokenDAO.getResetTokenByToken(token);
            if (!resetToken)
                return false;
            // throw new Error("Invalid token");
            const account = yield this.accountDAO.getAccountById(resetToken.acctId);
            if (!account)
                return false;
            // throw new Error("Invalid token");
            return true;
        });
    }
    resetPassword(token, password) {
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            const resetToken = yield this.resetTokenDAO.getResetTokenByToken(token);
            if (!resetToken)
                throw new Error("Invalid token");
            const account = yield this.accountDAO.getAccountById(resetToken.acctId);
            if (!account)
                throw new Error("Invalid token");
            // update password and remove reset token
            account.passwordHash = this.accountUtil.hash(password);
            account.passwordReset = Date.now();
            const resetTokenForAccount = yield this.resetTokenDAO.getAllResetTokensForAccount(account.acctId);
            try {
                for (var resetTokenForAccount_1 = __asyncValues(resetTokenForAccount), resetTokenForAccount_1_1; resetTokenForAccount_1_1 = yield resetTokenForAccount_1.next(), !resetTokenForAccount_1_1.done;) {
                    const token = resetTokenForAccount_1_1.value;
                    yield this.resetTokenDAO.deleteResetTokenByModel(token);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (resetTokenForAccount_1_1 && !resetTokenForAccount_1_1.done && (_a = resetTokenForAccount_1.return)) yield _a.call(resetTokenForAccount_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            yield account.save();
            return true;
        });
    }
    getRemainingCredits(acctId) {
        return __awaiter(this, void 0, void 0, function* () {
            const acct = yield this.accountDAO.getAccountById(acctId);
            if (acct === null) {
                throw Error("No account found for this id");
            }
            return acct.credits;
        });
    }
    addFreeCredits(acctId) {
        return __awaiter(this, void 0, void 0, function* () {
            const acct = yield this.accountDAO.getAccountById(acctId);
            if (acct === null) {
                throw Error("No account found for this id");
            }
            const freeCreditsAmount = yield this.accountDAO.addFreeCredits(acctId);
            return freeCreditsAmount;
        });
    }
    // authorized
    getAllAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            const accounts = yield this.accountDAO.getAllAccounts();
            return accounts.map((a) => this.basicDetails(a));
        });
    }
    getAccountById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield this.getAccount(id);
            return this.basicDetails(account);
        });
    }
    createAccount(params) {
        return __awaiter(this, void 0, void 0, function* () {
            // "what's in params?" => consult registerUserSchema
            // validate email
            if (yield this.accountDAO.getAccountByEmail(params.email)) {
                throw 'Email "' + params.email + '" is already registered';
            }
            const account = yield this.accountDAO.createAccount(params);
            // account.verified = "";
            // hash password
            account.passwordHash = this.accountUtil.hash(params.password);
            // save account
            yield account.save();
            return this.basicDetails(account);
        });
    }
    updateAccount(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield this.getAccount(id);
            // validate (if email was changed)
            if (params.email && account.email !== params.email && (yield this.accountDAO.getAccountByEmail(params.email))) {
                throw 'Email "' + params.email + '" is already taken';
            }
            // hash password if it was entered
            if (params.password) {
                params.passwordHash = this.accountUtil.hash(params.password);
            }
            // copy params to account and save
            Object.assign(account, params);
            account.updated = Date.now();
            yield account.save();
            return this.basicDetails(account);
        });
    }
    deleteAccount(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.deleteAccount(id);
        });
    }
    basicDetails(account) {
        const { acctId, email, role, updated, isVerified, credits, name } = account;
        const definitelyARole = role;
        return { acctId, email, role: definitelyARole, updated, isVerified, credits, name };
    }
    getAccount(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield this.accountDAO.getAccountById(id);
            if (!account)
                throw new Error("Account not found");
            return account;
        });
    }
    logVerificationToken(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield this.accountDAO.getAccountByEmail(email);
            console.log("token for email" + email + " is " + account[0].verificationToken);
        });
    }
}
exports.default = AuthService;
