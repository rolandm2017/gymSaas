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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const moment_1 = __importDefault(require("moment"));
//
const provider_enum_1 = require("../../enum/provider.enum");
const Task_1 = require("../models/Task");
const tryCatchClassDecorator_1 = require("../../util/tryCatchClassDecorator");
const Batch_1 = require("../models/Batch");
let TaskDAO = class TaskDAO {
    constructor() { }
    createTask(task) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Task_1.Task.create(task);
        });
    }
    getMultipleTasks(limit, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Task_1.Task.findAndCountAll({ offset, limit });
        });
    }
    getTaskById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Task_1.Task.findByPk(id);
        });
    }
    getHighestBatchNum() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Task_1.Task.findOne({ order: [["batchId", "DESC"]] });
        });
    }
    getMostRecentTaskForProvider(provider, batchNum) {
        return __awaiter(this, void 0, void 0, function* () {
            let conditions;
            if (batchNum) {
                conditions = { providerName: provider, batchId: batchNum };
            }
            else {
                conditions = { providerName: provider };
            }
            return yield Task_1.Task.findAll({
                limit: 1,
                where: conditions,
                order: [["createdAt", "DESC"]],
            });
        });
    }
    getTasksByBatchNum(batchNum) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Task_1.Task.findAll({ where: { batchId: batchNum } });
        });
    }
    getTasksByBatchNumAndCityId(batchNum, cityId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Task_1.Task.findAll({ where: { batchId: batchNum, cityId } });
        });
    }
    getTasksByBatchNumAndProvider(batchNum, providerName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Task_1.Task.findAll({ where: { batchId: batchNum, providerName } });
        });
    }
    getTasksByBatchNumAndCityIdAndProvider(batchNum, cityId, provider) {
        return __awaiter(this, void 0, void 0, function* () {
            // it looks like "all" could be passed but ideally it never gets here
            if (provider === provider_enum_1.ProviderEnumOrAll.all) {
                throw Error("Unintentional usage");
            }
            return yield Task_1.Task.findAll({ where: { batchId: batchNum, cityId, providerName: provider } });
        });
    }
    // Can't work because it doesn't allow create with associations.
    // public async async  bulkCreateTask = (tasks: TaskCreationAttributes[]) {
    //     return Task.bulkCreate(tasks);
    // };
    getNextUnfinishedTaskForProvider(provider, batchNum) {
        return __awaiter(this, void 0, void 0, function* () {
            let conditions;
            if (batchNum) {
                conditions = { providerName: provider, batchId: batchNum };
            }
            else {
                conditions = { providerName: provider };
            }
            return yield Task_1.Task.findAll({
                limit: 1,
                where: conditions,
                order: [["createdAt", "DESC"]],
            });
        });
    }
    getAllUnfinishedTasksForProvider(provider, batchNum) {
        return __awaiter(this, void 0, void 0, function* () {
            let conditions;
            if (batchNum) {
                conditions = { providerName: provider, lastScan: null, batchId: batchNum, ignore: false };
            }
            else {
                conditions = { providerName: provider, lastScan: null, ignore: false };
            }
            return yield Task_1.Task.findAll({
                where: conditions,
                order: [["createdAt", "DESC"]],
            });
        });
    }
    getAllTasks(providerName, batchId, cityId) {
        return __awaiter(this, void 0, void 0, function* () {
            // even finished ones.
            let conditions;
            if (providerName && batchId && cityId) {
                conditions = { providerName, batchId, cityId };
            }
            else if (providerName && batchId) {
                conditions = { providerName, batchId };
            }
            else if (batchId && cityId) {
                conditions = { batchId, cityId };
            }
            else if (providerName && cityId) {
                conditions = { providerName, cityId };
            }
            else if (providerName) {
                conditions = { providerName };
            }
            else if (batchId) {
                conditions = { batchId };
            }
            else if (cityId) {
                conditions = { cityId };
            }
            else {
                conditions = {};
            }
            return yield Task_1.Task.findAll({ where: conditions });
        });
    }
    getScorecard(providerName, batchNum) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Task_1.Task.findAll({ where: { providerName }, include: { model: Batch_1.Batch, where: { batchId: batchNum } } });
        });
    }
    // **
    // ** update section
    updateTask(task, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Task_1.Task.update(task, { where: { taskId: id } });
        });
    }
    updateLastScanDate(task, scanDate) {
        return __awaiter(this, void 0, void 0, function* () {
            task.lastScan = scanDate;
            yield task.save();
        });
    }
    markIgnored(task) {
        return __awaiter(this, void 0, void 0, function* () {
            // for when the scraper scans a place and gets 0 to 5 results
            task.ignore = true;
            yield task.save();
        });
    }
    deleteTask(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Task_1.Task.destroy({ where: { taskId } });
        });
    }
    deleteAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Task_1.Task.destroy({ where: {} });
        });
    }
    deleteTasksOlderThanTwoMonths() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Task_1.Task.destroy({
                where: {
                    createdAt: { [sequelize_1.Op.lte]: (0, moment_1.default)().subtract(2, "months").toDate() },
                },
            });
        });
    }
};
TaskDAO = __decorate([
    (0, tryCatchClassDecorator_1.TryCatchClassDecorator)(sequelize_1.EagerLoadingError, (err, context) => {
        console.log(context, err);
        throw err;
    })
], TaskDAO);
exports.default = TaskDAO;
