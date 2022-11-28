import { CityCreationAttributes } from "../database/models/City";
import { ProvinceIdEnum } from "../enum/canadaProvince.enum";
import { CityEnum } from "../enum/city.enum";

export const SEED_CITIES: CityCreationAttributes[] = [
    {
        stateId: ProvinceIdEnum.britishColumbia,
        cityName: CityEnum.vancouver,
        country: "Canada",
        centerLat: 49.2827,
        centerLong: -123.1207,
        scanRadius: 25,
        lastScan: null,
    },
    {
        stateId: ProvinceIdEnum.alberta,
        cityName: CityEnum.calgary,
        country: "Canada",
        centerLat: 51.0447,
        centerLong: -114.0719,
        scanRadius: 25,
        lastScan: null,
    },
    {
        stateId: ProvinceIdEnum.alberta,
        cityName: CityEnum.edmonton,
        country: "Canada",
        centerLat: 53.5461,
        centerLong: -113.4937,
        scanRadius: 25,
        lastScan: null,
    },
    {
        stateId: ProvinceIdEnum.manitoba,
        cityName: CityEnum.winnipeg,
        country: "Canada",
        centerLat: 49.8954,
        centerLong: -97.1385,
        scanRadius: 25,
        lastScan: null,
    },
    {
        stateId: ProvinceIdEnum.ontario,
        cityName: CityEnum.toronto,
        country: "Canada",
        centerLat: 43.6532,
        centerLong: -79.3832,
        scanRadius: 25,
        lastScan: null,
    },
    {
        stateId: ProvinceIdEnum.quebec,
        cityName: CityEnum.montreal,
        country: "Canada",
        centerLat: 45.5019,
        centerLong: -73.5674,
        scanRadius: 25,
        lastScan: null,
    },
];
