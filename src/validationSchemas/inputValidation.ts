import { z } from "zod";
import { CityNameEnum } from "../enum/cityName.enum";
import { ProviderEnum, ProviderEnumOrAll } from "../enum/provider.enum";
import { SuccessFilterEnum } from "../enum/successFilter.enum";

const stringSchema = z.string();
const emailSchema = z.string().email();
const numberSchema = z.number();
const dateSchema = z.date();
const stringArr = z.array(z.string());
const intArr = z.array(z.number());
const providerArr = z.union([z.literal(ProviderEnum.rentCanada), z.literal(ProviderEnum.rentFaster), z.literal(ProviderEnum.rentSeeker)]);
const providerArrIncludingAll = z.union([
    z.literal(ProviderEnumOrAll.rentCanada),
    z.literal(ProviderEnumOrAll.rentFaster),
    z.literal(ProviderEnumOrAll.rentSeeker),
    z.literal(ProviderEnumOrAll.all),
]);
const successFilterArr = z.union([z.literal(SuccessFilterEnum.all), z.literal(SuccessFilterEnum.success), z.literal(SuccessFilterEnum.ignored)]);

export function isStringInteger(testSubject: unknown): number {
    const stringInput = stringSchema.parse(testSubject);
    const toNumber = parseInt(stringInput);
    return numberSchema.parse(toNumber);
}

export function isStringFloat(testSubject: unknown): number {
    const narrowedToString = isString(testSubject);
    const toFloat = parseFloat(narrowedToString);
    return numberSchema.parse(toFloat);
}

export function isInteger(testSubject: unknown): number {
    return numberSchema.parse(testSubject);
}

export function isString(testSubject: unknown): string {
    return stringSchema.parse(testSubject);
}

export function isEmail(testSubject: unknown): string {
    return emailSchema.parse(testSubject);
}

export function isProvider(testSubject: unknown): ProviderEnum {
    return providerArr.parse(testSubject);
}

export function isProviderOrAll(testSubject: unknown): ProviderEnumOrAll {
    return providerArrIncludingAll.parse(testSubject);
}

export function isASuccessFilter(testSubject: unknown): SuccessFilterEnum {
    return successFilterArr.parse(testSubject);
}

export function isLegitCityName(testSubject: unknown): CityNameEnum {
    const isCityName = Object.values(CityNameEnum).some(name => name == testSubject);
    if (isCityName) return testSubject as CityNameEnum;
    else throw new Error("Invalid city name");
}

export function arrayIsAllStrings(testSubject: unknown[]): string[] {
    return stringArr.parse(testSubject);
}

export function arrayIsAllInteger(testSubject: unknown[]): number[] {
    return intArr.parse(testSubject);
}

export function isDate(testSubject: unknown): Date {
    return dateSchema.parse(testSubject);
}
