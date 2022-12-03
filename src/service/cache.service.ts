import { getCityIdFromCacheElseDb, setCityId } from "../database/cache/cityIdCache";
import {
    getBatchNumForNewBatches,
    setBatchNumForNewBatches,
    addBatchNumIfNotExists,
    initBatchCacheFromDb,
    getAllBatchNums,
} from "../database/cache/batchNumCache";
import CityDAO from "../database/dao/city.dao";
import BatchDAO from "../database/dao/batch.dao";
import { IBatch } from "../interface/Batch.interface";
// todo

class CacheService {
    private cityDAO: CityDAO;
    private batchDAO: BatchDAO;
    constructor(cityDAO: CityDAO, batchDAO: BatchDAO) {
        this.cityDAO = cityDAO;
        this.batchDAO = batchDAO;
    }

    // city id stuff
    public async getCityId(city: string) {
        return await getCityIdFromCacheElseDb(city, this.cityDAO);
    }

    public setCityId(cityName: string, cityId: number) {
        setCityId(cityName, cityId);
        return true;
    }

    // batch num stuff
    public async getBatchNumForNewBatches() {
        return await getBatchNumForNewBatches(this.batchDAO);
    }

    public setBatchNumForNewBatches(newNum: number) {
        setBatchNumForNewBatches(newNum, this.batchDAO);
        return true;
    }

    public addBatchNumIfNotExists(newNum: number): Promise<number[] | undefined> {
        return addBatchNumIfNotExists(newNum, this.batchDAO);
    }

    public async getAllBatchNums() {
        return getAllBatchNums();
    }

    // init functions for when the server restarts
    public async initBatchCache() {
        const batchNums = await this.batchDAO.getAllBatchNums();
        const justNums = batchNums.map((batch: IBatch) => batch.batchId);
        initBatchCacheFromDb(justNums);
    }

    public async initCityIdCache(): Promise<void> {
        const cities = await this.cityDAO.getAllCities();
        const namesAndIds = cities.map(city => {
            return {
                cityName: city.cityName,
                cityId: city.cityId,
            };
        });
        for (const city of namesAndIds) {
            setCityId(city.cityName, city.cityId);
        }
    }
}

export default CacheService;
