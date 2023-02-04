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
const Feedback_1 = require("../models/Feedback");
const sequelize_1 = require("sequelize");
const tryCatchClassDecorator_1 = require("../../util/tryCatchClassDecorator");
let FeedbackDAO = class FeedbackDAO {
    constructor() { }
    //
    createFeedback(feedback) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Feedback_1.Feedback.create(feedback);
        });
    }
    readLatest() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Feedback_1.Feedback.findOne({
                where: {},
                order: [["createdAt", "DESC"]],
            });
        });
    }
    getFeedbackByFeedbackId(feedbackId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Feedback_1.Feedback.findByPk(feedbackId);
        });
    }
    getAllFeedbackForProfile(profileId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Feedback_1.Feedback.findAll({ where: { profileId } });
        });
    }
    getRecentFeedbackForProfile(profileId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Feedback_1.Feedback.findAll({
                where: {
                    profileId,
                    createdAt: {
                        [sequelize_1.Op.lt]: new Date(Date.now() - 60 * 60 * 1000),
                    },
                },
            });
        });
    }
    getAllFeedback() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Feedback_1.Feedback.findAll({});
        });
    }
    continueFeedbackStream(feedback, profileId) {
        return __awaiter(this, void 0, void 0, function* () {
            const affected = yield Feedback_1.Feedback.update(feedback, { where: { profileId } });
            return affected[0];
        });
    }
};
FeedbackDAO = __decorate([
    (0, tryCatchClassDecorator_1.TryCatchClassDecorator)(Error, (err, context) => {
        console.log(context, err);
        throw err;
    })
], FeedbackDAO);
exports.default = FeedbackDAO;