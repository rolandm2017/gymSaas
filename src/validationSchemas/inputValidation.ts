import { z } from "zod";
import { CityNameEnum } from "../enum/cityName.enum";
import { ProviderEnum } from "../enum/provider.enum";

const stringSchema = z.string();
const emailSchema = z.string().email();
const numberSchema = z.number();
const dateSchema = z.date();
const stringArr = z.array(z.string());
const intArr = z.array(z.number());
const providerArr = z.union([z.literal(ProviderEnum.rentCanada), z.literal(ProviderEnum.rentFaster), z.literal(ProviderEnum.rentSeeker)]);

export function isStringInteger(testSubject: unknown): number {
    const stringInput = stringSchema.parse(testSubject);
    const toNumber = parseInt(stringInput, 10);
    return numberSchema.parse(toNumber);
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

export function isLegitCityName(testSubject: unknown): CityNameEnum {
    const isCityName = Object.values(CityNameEnum).some(name => name == testSubject);
    console.log(testSubject, isCityName, "38rm");
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
