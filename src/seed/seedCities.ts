import { CityCreationAttributes } from "../database/models/City";
import { CityEnum } from "../enum/city.enum";

export const SEED_CITIES: CityCreationAttributes[] = [
    {
        city: CityEnum.vancouver,
        state: "British Columbia",
        country: "Canada",
        centerLat: 49.2827,
        centerLong: -123.1207,
        scanRadius: 25,
        lastScan: null,
    },
    {
        city: CityEnum.calgary,
        state: "Alberta",
        country: "Canada",
        centerLat: 51.0447,
        centerLong: -114.0719,
        scanRadius: 25,
        lastScan: null,
    },
    {
        city: CityEnum.edmonton,
        state: "Alberta",
        country: "Canada",
        centerLat: 53.5461,
        centerLong: -113.4937,
        scanRadius: 25,
        lastScan: null,
    },
    {
        city: CityEnum.winnipeg,
        state: "Manitoba",
        country: "Canada",
        centerLat: 49.8954,
        centerLong: -97.1385,
        scanRadius: 25,
        lastScan: null,
    },
    {
        city: CityEnum.toronto,
        state: "Ontario",
        country: "Canada",
        centerLat: 43.6532,
        centerLong: -79.3832,
        scanRadius: 25,
        lastScan: null,
    },
    {
        city: CityEnum.montreal,
        state: "Quebec",
        country: "Canada",
        centerLat: 45.5019,
        centerLong: -73.5674,
        scanRadius: 25,
        lastScan: null,
    },
];
