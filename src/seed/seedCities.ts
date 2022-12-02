import { CityCreationAttributes } from "../database/models/City";
import { ProvinceIdEnum } from "../enum/canadaProvinceId.enum";
import { CityNameEnum } from "../enum/cityName.enum";

export const SEED_CITIES: CityCreationAttributes[] = [
    {
        stateId: ProvinceIdEnum.britishColumbia,
        cityName: CityNameEnum.vancouver, // 1
        country: "Canada",
        centerLat: 49.2827,
        centerLong: -123.1207,
        scanRadius: 25,
        lastScan: null,
    },
    {
        stateId: ProvinceIdEnum.alberta,
        cityName: CityNameEnum.calgary, // 2
        country: "Canada",
        centerLat: 51.0447,
        centerLong: -114.0719,
        scanRadius: 25,
        lastScan: null,
    },
    {
        stateId: ProvinceIdEnum.alberta,
        cityName: CityNameEnum.edmonton, // 3
        country: "Canada",
        centerLat: 53.5461,
        centerLong: -113.4937,
        scanRadius: 25,
        lastScan: null,
    },
    {
        stateId: ProvinceIdEnum.manitoba,
        cityName: CityNameEnum.winnipeg, // 4
        country: "Canada",
        centerLat: 49.8954,
        centerLong: -97.1385,
        scanRadius: 25,
        lastScan: null,
    },
    {
        stateId: ProvinceIdEnum.ontario,
        cityName: CityNameEnum.toronto, // 5
        country: "Canada",
        centerLat: 43.6532,
        centerLong: -79.3832,
        scanRadius: 25,
        lastScan: null,
    },
    {
        stateId: ProvinceIdEnum.ontario,
        cityName: CityNameEnum.mississauga, // 6
        country: "Canada",
        centerLat: 43.589,
        centerLong: -79.6441,
        scanRadius: 25,
        lastScan: null,
    },
    {
        stateId: ProvinceIdEnum.ontario,
        cityName: CityNameEnum.brampton, // 7
        country: "Canada",
        centerLat: 43.7315,
        centerLong: -79.7624,
        scanRadius: 25,
        lastScan: null,
    },
    {
        stateId: ProvinceIdEnum.ontario,
        cityName: CityNameEnum.hamilton, // 8
        country: "Canada",
        centerLat: 43.2557,
        centerLong: -79.8711,
        scanRadius: 25,
        lastScan: null,
    },
    {
        stateId: ProvinceIdEnum.ontario,
        cityName: CityNameEnum.ottawa, // 9
        country: "Canada",
        centerLat: 45.4215,
        centerLong: -75.6972,
        scanRadius: 25,
        lastScan: null,
    },
    {
        stateId: ProvinceIdEnum.quebec,
        cityName: CityNameEnum.montreal, // 10
        country: "Canada",
        centerLat: 45.5019,
        centerLong: -73.5674,
        scanRadius: 25,
        lastScan: null,
    },
];
