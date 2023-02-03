"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRealUrl = void 0;
const provider_enum_1 = require("../enum/provider.enum");
function createRealUrl(insert, provider) {
    const rentCanadaUrlBase = `https://www.rentcanada.com${insert}`;
    const rentFasterUrlBase = `https://www.rentfaster.ca${insert}`;
    const rentSeekerUrlBase = `${insert}`; // they give the full url
    if (provider === provider_enum_1.ProviderEnum.rentCanada)
        return rentCanadaUrlBase;
    if (provider === provider_enum_1.ProviderEnum.rentFaster)
        return rentFasterUrlBase;
    if (provider === provider_enum_1.ProviderEnum.rentSeeker)
        return rentSeekerUrlBase;
    throw Error("Incorrect provider type");
}
exports.createRealUrl = createRealUrl;
