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
const Account_1 = require("../models/Account");
const Profile_1 = require("../models/Profile");
const tryCatchClassDecorator_1 = require("../../util/tryCatchClassDecorator");
let ProfileDAO = class ProfileDAO {
    constructor() { }
    //
    createProfileByIp(ipAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Profile_1.Profile.create({ ipAddress });
        });
    }
    recordPublicPickHousing(ipAddress, housing) {
        return __awaiter(this, void 0, void 0, function* () {
            const profiles = yield Profile_1.Profile.findAll({ where: { ipAddress } });
            const noProfilesFound = profiles.length === 0;
            // if ip addr is new, create a profile;
            if (noProfilesFound) {
                const newProfile = yield Profile_1.Profile.create({ ipAddress });
                yield newProfile.addFavoriteApartments([housing]);
                return newProfile;
            }
            else {
                // if ip addr is previously seen, update their housing ids
                const profile = profiles[0];
                yield profile.addFavoriteApartments([housing]);
                return profile;
            }
        });
    }
    recordPublicPickGym(ipAddress, gym) {
        return __awaiter(this, void 0, void 0, function* () {
            const profiles = yield Profile_1.Profile.findAll({ where: { ipAddress } });
            const noneFound = profiles.length === 0;
            // if ip addr is new, create a profile;
            if (noneFound) {
                const created = yield Profile_1.Profile.create({ ipAddress });
                created.addGymPick(gym);
                created.save();
                return created;
            }
            else {
                // if ip addr is previously seen, update their housing ids
                const profile = profiles[0];
                profile.addGymPick(gym);
                profile.save();
                return profile;
            }
        });
    }
    recordAuthedPickHousing(profileId, housing) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield Profile_1.Profile.findOne({ where: { profileId } });
            if (profile === null) {
                throw Error("No profile found for this id");
            }
            yield profile.addFavoriteApartment(housing);
            return profile;
        });
    }
    // **
    // ** read section
    getProfileForAccountId(accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Profile_1.Profile.findOne({ include: { required: true, model: Account_1.Account, where: { acctId: accountId }, as: "account" } });
        });
    }
    getAllHousingPicksByAccountId(acctId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield Profile_1.Profile.findOne({ include: { required: true, model: Account_1.Account, where: { acctId }, as: "account" } });
            if (profile === null) {
                throw new Error("Profile not found for this account id");
            }
            return profile.getFavoriteApartments();
        });
    }
    getAllHousingPicksByIp(ipAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield Profile_1.Profile.findOne({ where: { ipAddress } });
            if (profile === null) {
                throw new Error("Profile not found for this ip address");
            }
            const housings = yield profile.getFavoriteApartments();
            return housings;
        });
    }
    testGetAllHousings(profileId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Profile_1.Profile.findOne({ where: { profileId }, include: "housings" });
        });
    }
    getAllHousingPicksByProfileId(profileId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield Profile_1.Profile.findOne({ where: { profileId } });
            if (profile === null) {
                throw new Error("Profile not found for this profile id");
            }
            const housings = yield profile.getFavoriteApartments();
            return housings;
        });
    }
    getAllGymPicksByAccountId(acctId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield Profile_1.Profile.findOne({ include: { required: true, model: Account_1.Account, where: { acctId } } });
            if (profile === null) {
                throw new Error("Profile not found for this account id");
            }
            return profile.getGymPicks();
        });
    }
    getAllGymPicksByProfileId(profileId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield Profile_1.Profile.findOne({ where: { profileId } });
            if (profile === null) {
                throw new Error("Profile not found for this profile id");
            }
            return profile.getGymPicks();
        });
    }
    getAllGymPicksByIp(ipAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Profile_1.Profile.findOne({ where: { ipAddress }, include: "gym" });
        });
    }
    getProfileByIp(ipAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Profile_1.Profile.findOne({ where: { ipAddress } });
        });
    }
    getAllProfiles() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Profile_1.Profile.findAll({ include: { model: Account_1.Account, as: "account" } });
        });
    }
    getAccountForProfile(profileId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Profile_1.Profile.findOne({ where: { profileId }, include: Account_1.Account });
        });
    }
    addRevealedTo(profile, housingId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield profile.addReveal(housingId);
        });
    }
    // update
    associateProfileWithAccount(profileId, account) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield Profile_1.Profile.findOne({ where: { profileId } });
            if (profile === null) {
                throw new Error("Profile not found for this profile id");
            }
            yield profile.setAccount(account);
            return profile;
        });
    }
    // delete
    removeHousingPick(profileId, housing) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield Profile_1.Profile.findOne({ where: { profileId } });
            if (profile === null) {
                throw new Error("Profile not found for this profile id");
            }
            yield profile.removeFavoriteApartment(housing);
        });
    }
};
ProfileDAO = __decorate([
    (0, tryCatchClassDecorator_1.TryCatchClassDecorator)(Error, (err, context) => {
        console.log(context, err);
        throw err;
    })
], ProfileDAO);
exports.default = ProfileDAO;
