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
Object.defineProperty(exports, "__esModule", { value: true });
class AdminService {
    constructor(accountDAO) {
        this.accountDAO = accountDAO;
    }
    makeAdmin(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const numberOfAdmins = yield this.accountDAO.countAdmins();
            if (numberOfAdmins === 0) {
                yield this.accountDAO.createAdmin(email);
                const account = yield this.accountDAO.getAccountByEmail(email);
                return account;
            }
            else {
                return [];
            }
        });
    }
    banUser(acctId) {
        return __awaiter(this, void 0, void 0, function* () {
            const success = yield this.accountDAO.banUser(acctId);
            if (success > 1)
                throw new Error("banned multiple users via one account id");
            if (success == 1)
                return true;
            return false;
        });
    }
}
exports.default = AdminService;
