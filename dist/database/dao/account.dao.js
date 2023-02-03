"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const role_enum_1 = require("../../enum/role.enum");
const constants_1 = require("../../util/constants");
const tryCatchClassDecorator_1 = require("../../util/tryCatchClassDecorator");
const userAuthSchemas_1 = require("../../validationSchemas/userAuthSchemas");
const Account_1 = require("../models/Account");
let AccountDAO = class AccountDAO {
    constructor() { }
    createAccount(account) {
        return __awaiter(this, void 0, void 0, function* () {
            const isReallyEmail = (0, userAuthSchemas_1.isEmail)(account.email);
            if (!isReallyEmail)
                throw new Error("Email field wasn't an email");
            const created = yield Account_1.Account.create(account);
            return created;
        });
    }
    createGoogleLoginAccount(fullName, googleId, email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Account_1.Account.create({ googleId, email, passwordHash: "", role: role_enum_1.Role.User, credits: constants_1.FREE_CREDITS, name: fullName, ipAddress: "" });
        });
    }
    createAdmin(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const affected = yield Account_1.Account.update({ role: role_enum_1.Role.Admin }, { where: { email } });
            return affected[0];
        });
    }
    getCurrentCredits(accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield Account_1.Account.findOne({ where: { acctId: accountId } });
            if (account == null)
                throw Error("No account found for this id");
            return account.credits;
        });
    }
    getAccountByAccountId(accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Account_1.Account.findByPk(accountId);
        });
    }
    countAdmins() {
        return __awaiter(this, void 0, void 0, function* () {
            const accounts = yield Account_1.Account.findAndCountAll({ where: { role: role_enum_1.Role.Admin } });
            return accounts.count;
        });
    }
    getAllAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Account_1.Account.findAll();
        });
    }
    findAllAccountsWithTokens() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Account_1.Account.findAll({ include: "their_refresh_tokens" });
        });
    }
    getMultipleAccounts(limit, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            const accts = yield Account_1.Account.findAndCountAll({ offset, limit });
            return accts;
        });
    }
    getAccountByGoogleId(googleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const all = yield Account_1.Account.findAll({ where: { googleId } });
            if (all.length > 0) {
                return all[0];
            }
            return null;
        });
    }
    getAccountById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Account_1.Account.findByPk(id);
        });
    }
    getAccountByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const isReallyEmail = (0, userAuthSchemas_1.isEmail)(email);
            if (!isReallyEmail)
                throw new Error("Email field wasn't an email");
            const acct = yield Account_1.Account.findAll({
                where: { email: email },
            });
            return acct;
        });
    }
    getAccountByRefreshToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const found = yield Account_1.Account.findAll({
                where: { acctId: token.acctId },
                include: "their_refresh_tokens",
            });
            if (found.length === 0)
                return null;
            if (found.length >= 2)
                throw Error("Multiple accounts for a refresh token"); // todo: log failure
            return found[0];
        });
    }
    getAccountByVerificationToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Account_1.Account.findOne({ where: { verificationToken: token } });
        });
    }
    // **
    // update section
    banUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const affected = yield Account_1.Account.update({ isBanned: true }, { where: { acctId: userId } });
            return affected[0];
        });
    }
    updateAccount(account, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const affected = yield Account_1.Account.update(account, { where: { acctId: id } });
            return affected[0];
        });
    }
    associateAccountWithProfile(accountId, profile) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield Account_1.Account.findOne({ where: { acctId: accountId } });
            if (account === null) {
                throw new Error("Account not found for this account id");
            }
            yield account.setProfile(profile);
            return account;
        });
    }
    deductCredit(accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield Account_1.Account.findOne({ where: { acctId: accountId } });
            if (account == null)
                throw Error("No account found for this id");
            const currentCredits = account.credits;
            yield Account_1.Account.update({ credits: currentCredits - 1 }, { where: { acctId: accountId } });
        });
    }
    addFreeCredits(acctId) {
        return __awaiter(this, void 0, void 0, function* () {
            const newAmount = yield Account_1.Account.update({ credits: constants_1.FREE_CREDITS }, { where: { acctId } });
            return constants_1.FREE_CREDITS;
        });
    }
    // **
    // delete section **
    deleteAccount(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const affected = yield Account_1.Account.destroy({ where: { acctId: id } });
            return affected;
        });
    }
};
AccountDAO = __decorate([
    (0, tryCatchClassDecorator_1.TryCatchClassDecorator)(Error, (err, context) => {
        console.log(context, err);
        throw err;
    })
], AccountDAO);
exports.default = AccountDAO;
