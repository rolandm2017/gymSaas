"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDate = exports.arrayIsAllInteger = exports.arrayIsAllStrings = exports.isLegitCityName = exports.isASuccessFilter = exports.isProviderOrAll = exports.isProvider = exports.isEmail = exports.isString = exports.isInteger = exports.isStringFloat = exports.isStringInteger = void 0;
const zod_1 = require("zod");
const cityName_enum_1 = require("../enum/cityName.enum");
const provider_enum_1 = require("../enum/provider.enum");
const successFilter_enum_1 = require("../enum/successFilter.enum");
const stringSchema = zod_1.z.string();
const emailSchema = zod_1.z.string().email();
const numberSchema = zod_1.z.number();
const dateSchema = zod_1.z.date();
const stringArr = zod_1.z.array(zod_1.z.string());
const intArr = zod_1.z.array(zod_1.z.number());
const providerArr = zod_1.z.union([zod_1.z.literal(provider_enum_1.ProviderEnum.rentCanada), zod_1.z.literal(provider_enum_1.ProviderEnum.rentFaster), zod_1.z.literal(provider_enum_1.ProviderEnum.rentSeeker)]);
const providerArrIncludingAll = zod_1.z.union([
    zod_1.z.literal(provider_enum_1.ProviderEnumOrAll.rentCanada),
    zod_1.z.literal(provider_enum_1.ProviderEnumOrAll.rentFaster),
    zod_1.z.literal(provider_enum_1.ProviderEnumOrAll.rentSeeker),
    zod_1.z.literal(provider_enum_1.ProviderEnumOrAll.all),
]);
const successFilterArr = zod_1.z.union([zod_1.z.literal(successFilter_enum_1.SuccessFilterEnum.all), zod_1.z.literal(successFilter_enum_1.SuccessFilterEnum.success), zod_1.z.literal(successFilter_enum_1.SuccessFilterEnum.ignored)]);
function isStringInteger(testSubject) {
    const stringInput = stringSchema.parse(testSubject);
    const toNumber = parseInt(stringInput);
    return numberSchema.parse(toNumber);
}
exports.isStringInteger = isStringInteger;
function isStringFloat(testSubject) {
    const narrowedToString = isString(testSubject);
    const toFloat = parseFloat(narrowedToString);
    return numberSchema.parse(toFloat);
}
exports.isStringFloat = isStringFloat;
function isInteger(testSubject) {
    return numberSchema.parse(testSubject);
}
exports.isInteger = isInteger;
function isString(testSubject) {
    return stringSchema.parse(testSubject);
}
exports.isString = isString;
function isEmail(testSubject) {
    return emailSchema.parse(testSubject);
}
exports.isEmail = isEmail;
function isProvider(testSubject) {
    return providerArr.parse(testSubject);
}
exports.isProvider = isProvider;
function isProviderOrAll(testSubject) {
    return providerArrIncludingAll.parse(testSubject);
}
exports.isProviderOrAll = isProviderOrAll;
function isASuccessFilter(testSubject) {
    return successFilterArr.parse(testSubject);
}
exports.isASuccessFilter = isASuccessFilter;
function isLegitCityName(testSubject) {
    const isCityName = Object.values(cityName_enum_1.CityNameEnum).some(name => name == testSubject);
    if (isCityName)
        return testSubject;
    else
        throw new Error("Invalid city name");
}
exports.isLegitCityName = isLegitCityName;
function arrayIsAllStrings(testSubject) {
    return stringArr.parse(testSubject);
}
exports.arrayIsAllStrings = arrayIsAllStrings;
function arrayIsAllInteger(testSubject) {
    return intArr.parse(testSubject);
}
exports.arrayIsAllInteger = arrayIsAllInteger;
function isDate(testSubject) {
    return dateSchema.parse(testSubject);
}
exports.isDate = isDate;
