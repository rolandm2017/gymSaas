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
class WishService {
    constructor(wishDAO, profileDAO) {
        //
        this.wishDAO = wishDAO;
        this.profileDAO = profileDAO;
    }
    createWish(wishLocation, acctId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield this.profileDAO.getProfileForAccountId(acctId);
            const noProfileFound = profile === null;
            if (noProfileFound) {
                throw Error("No profile found for this account");
            }
            return yield this.wishDAO.createWish({ wishLocation, profileId: profile.profileId });
        });
    }
    getAllWishesForAccount(acctId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield this.profileDAO.getProfileForAccountId(acctId);
            const noProfileFound = profile === null;
            if (noProfileFound) {
                throw Error("No profile found for this account");
            }
            return yield this.wishDAO.getAllWishesForProfile(profile.profileId);
        });
    }
    getAllWishes() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.wishDAO.getAllWishes();
        });
    }
}
exports.default = WishService;
