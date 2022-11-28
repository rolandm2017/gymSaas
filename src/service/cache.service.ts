import { getCityIdFromCacheElseDb, setCityId } from "../database/cache/cityIdCache";
import { getBatchNumForNewBatches, setBatchNumForNewBatches, addBatchNumIfNotExists, initBatchCacheFromDb } from "../database/cache/batchNumCache";
import CityDAO from "../database/dao/city.dao";
import BatchDAO from "../database/dao/batch.dao";
import { Batch } from "../database/models/Batch";
import { IBatch } from "../interface/Batch.interface";
// todo

class CacheService {
    private cityDAO: CityDAO;
    private batchDAO: BatchDAO;
    constructor(cityDAO: CityDAO, batchDAO: BatchDAO) {
        this.cityDAO = cityDAO;
        this.batchDAO = batchDAO;
    }

    public async getCityId(city: string) {
        return await getCityIdFromCacheElseDb(city, this.cityDAO);
    }

    public setCityId(city: string, cityId: number) {
        setCityId(city, cityId);
        return true;
    }

    public async getBatchNumForNewBatches() {
        return await getBatchNumForNewBatches(this.batchDAO);
    }

    public setBatchNumForNewBatches(newNum: number) {
        setBatchNumForNewBatches(newNum, this.batchDAO);
        return true;
    }

    public addBatchNumIfNotExists(newNum: number) {
        addBatchNumIfNotExists(newNum, this.batchDAO);
    }

    public async initBatchCache() {
        const batchNums = await this.batchDAO.getAllBatchNums();
        const justNums = batchNums.map((batch: IBatch) => batch.batchId);
        initBatchCacheFromDb(justNums);
    }
}

export default CacheService;
