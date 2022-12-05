import { GymCreationAttributes } from "../../../src/database/models/Gym";
import { CityNameEnum } from "../../../src/enum/cityName.enum";
import { SEED_CITIES } from "../../../src/seed/seedCities";

export const dummyGymData: GymCreationAttributes[] = [
    {
        cityName: CityNameEnum.montreal,
        address: "123 placeholder avenue",
        url: "https://www.google.ca",
        name: "Ron's Gym",
        lat: SEED_CITIES[9].centerLat,
        long: SEED_CITIES[9].centerLong,
    },
    {
        cityName: CityNameEnum.montreal,
        address: "123 placeholder avenue",
        url: "https://www.google.ca",
        name: "Ron's Gym",
        lat: SEED_CITIES[9].centerLat - 0.01,
        long: SEED_CITIES[9].centerLong - 0.01,
    },
];
