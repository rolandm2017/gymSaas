import { ProviderEnum } from "../enum/provider.enum";

export function createRealUrl(insert: string, provider: string) {
    const rentCanadaUrlBase = `https://www.rentcanada.com${insert}`;
    const rentFasterUrlBase = `https://www.rentfaster.ca${insert}`;
    const rentSeekerUrlBase = `${insert}`; // they give the full url

    if (provider === ProviderEnum.rentCanada) return rentCanadaUrlBase;
    if (provider === ProviderEnum.rentFaster) return rentFasterUrlBase;
    if (provider === ProviderEnum.rentSeeker) return rentSeekerUrlBase;
    throw Error("Incorrect provider type");
}
