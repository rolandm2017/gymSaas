import { StateCreationAttributes } from "../database/models/State";
import { ProvinceIdEnum } from "../enum/canadaProvinceId.enum";
import { StateNamesEnum } from "../enum/stateName.enum";

// canada
export const SEED_STATES: StateCreationAttributes[] = [
    {
        stateId: ProvinceIdEnum.britishColumbia,
        name: StateNamesEnum.britishColumbia,
        country: "Canada",
    },
    {
        stateId: ProvinceIdEnum.alberta,
        name: StateNamesEnum.alberta,
        country: "Canada",
    },
    {
        stateId: ProvinceIdEnum.saskatchewan,
        name: StateNamesEnum.saskatchewan,
        country: "Canada",
    },
    {
        stateId: ProvinceIdEnum.manitoba,
        name: StateNamesEnum.manitoba,
        country: "Canada",
    },
    {
        stateId: ProvinceIdEnum.ontario,
        name: StateNamesEnum.ontario,
        country: "Canada",
    },
    {
        stateId: ProvinceIdEnum.quebec,
        name: StateNamesEnum.quebec,
        country: "Canada",
    },
    {
        stateId: ProvinceIdEnum.PEI,
        name: StateNamesEnum.PEI,
        country: "Canada",
    },
    {
        stateId: ProvinceIdEnum.newBrunswick,
        name: StateNamesEnum.newBrunswick,
        country: "Canada",
    },
    {
        stateId: ProvinceIdEnum.novaScotia,
        name: StateNamesEnum.novaScotia,
        country: "Canada",
    },
    {
        stateId: ProvinceIdEnum.newfoundland,
        name: StateNamesEnum.newfoundland,
        country: "Canada",
    },
    {
        stateId: ProvinceIdEnum.yukon,
        name: StateNamesEnum.yukon,
        country: "Canada",
    },
    {
        stateId: ProvinceIdEnum.nunavut,
        name: StateNamesEnum.nunavut,
        country: "Canada",
    },
    {
        stateId: ProvinceIdEnum.northwestTerritories,
        name: StateNamesEnum.northwestTerritories,
        country: "Canada",
    },
];
