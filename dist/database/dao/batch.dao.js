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
const tryCatchClassDecorator_1 = require("../../util/tryCatchClassDecorator");
const Batch_1 = require("../models/Batch");
let BatchDAO = class BatchDAO {
    constructor() { }
    addBatchNum(newBatchNum) {
        return __awaiter(this, void 0, void 0, function* () {
            if (newBatchNum !== undefined) {
                return yield Batch_1.Batch.create({ batchId: newBatchNum });
            }
            const highestCurrent = yield this.getHighestBatchNum();
            if (highestCurrent)
                return yield Batch_1.Batch.create({ batchId: highestCurrent + 1 });
            else
                return yield Batch_1.Batch.create({ batchId: 1 });
        });
    }
    getHighestBatchNum() {
        return __awaiter(this, void 0, void 0, function* () {
            const batches = yield Batch_1.Batch.findAll({ where: {}, order: [["batchId", "DESC"]], limit: 1 });
            if (batches.length === 0)
                return null;
            return batches[0].batchId;
        });
    }
    getAllBatchNums() {
        return __awaiter(this, void 0, void 0, function* () {
            const batches = yield Batch_1.Batch.findAll({});
            const justNums = batches.map(b => b.batchId);
            return justNums;
        });
    }
    deleteAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const deleted = yield Batch_1.Batch.destroy({ where: {} });
            return deleted;
        });
    }
};
BatchDAO = __decorate([
    (0, tryCatchClassDecorator_1.TryCatchClassDecorator)(Error, (err, context) => {
        console.log(context, err);
        throw err;
    })
], BatchDAO);
exports.default = BatchDAO;
