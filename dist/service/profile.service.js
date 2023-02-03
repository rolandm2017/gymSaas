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
const removeUrl_1 = require("../util/removeUrl");
class ProfileService {
    constructor(profileDAO, accountDAO, housingDAO, gymDAO) {
        //
        this.profileDAO = profileDAO;
        this.accountDAO = accountDAO;
        this.housingDAO = housingDAO;
        this.gymDAO = gymDAO;
    }
    recordPublicPickHousing(ipAddress, housingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const housing = yield this.housingDAO.getHousingByHousingId(housingId);
            if (housing === null) {
                throw Error("No housing found");
            }
            return yield this.profileDAO.recordPublicPickHousing(ipAddress, housing);
        });
    }
    recordPublicPickGym(ipAddress, gymId) {
        return __awaiter(this, void 0, void 0, function* () {
            const gym = yield this.gymDAO.getGymByGymId(gymId);
            if (gym === null) {
                throw Error("No gym found");
            }
            return yield this.profileDAO.recordPublicPickGym(ipAddress, gym);
        });
    }
    recordAuthedPickHousing(acctId, housingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield this.profileDAO.getProfileForAccountId(acctId);
            if (profile === null) {
                throw Error("Profile not found for this account id");
            }
            const housing = yield this.housingDAO.getHousingByHousingId(housingId);
            if (housing === null) {
                throw Error("Housing not found for this housing id");
            }
            yield this.profileDAO.recordAuthedPickHousing(profile.profileId, housing);
            return housingId; // if returned, success!
        });
    }
    getAllHousingPicks(acctId) {
        return __awaiter(this, void 0, void 0, function* () {
            const housings = yield this.profileDAO.getAllHousingPicksByAccountId(acctId);
            const housingWithoutUrls = housings.map(h => (0, removeUrl_1.removeUrl)(h));
            return housingWithoutUrls;
        });
    }
    getAllHousingPicksByIp(ipAddr) {
        return __awaiter(this, void 0, void 0, function* () {
            const housings = yield this.profileDAO.getAllHousingPicksByIp(ipAddr);
            const housingWithoutUrls = housings.map(h => (0, removeUrl_1.removeUrl)(h));
            return housingWithoutUrls;
        });
    }
    getAllGymPicks(acctId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.profileDAO.getAllGymPicksByAccountId(acctId);
        });
    }
    getAllGymPicksByIp(ipAddr) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.profileDAO.getAllGymPicksByIp(ipAddr);
        });
    }
    associateProfileWithAccount(accountId, ipAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield this.accountDAO.getAccountByAccountId(accountId);
            if (account === null) {
                throw Error("No account found");
            }
            const profile = yield this.profileDAO.getProfileByIp(ipAddress);
            const noProfileFound = profile === null;
            if (noProfileFound) {
                // create one
                const profile = yield this.profileDAO.createProfileByIp(ipAddress);
                return yield this.profileDAO.associateProfileWithAccount(profile.profileId, account);
            }
            profile.acctId = accountId;
            return yield this.profileDAO.associateProfileWithAccount(profile.profileId, account);
        });
    }
    deleteHousingPick(accountId, toDeleteId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield this.profileDAO.getProfileForAccountId(accountId);
            if (profile === null) {
                throw Error("Profile not found for this account id");
            }
            const housing = yield this.housingDAO.getHousingByHousingId(toDeleteId);
            if (housing === null) {
                throw Error("Housing not found for this housing id");
            }
            yield this.profileDAO.removeHousingPick(profile.profileId, housing);
            return toDeleteId; // if returned, success!
        });
    }
    deleteGymPick(accountId, toDeleteId) {
        return __awaiter(this, void 0, void 0, function* () {
            //
        });
    }
}
exports.default = ProfileService;
