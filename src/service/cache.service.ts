import { getCityIdFromCacheElseDb, setCityId } from "../database/cache/cityIdCache";
import { getBatchNumForNewBatches, setBatchNum } from "../database/cache/batchNumCache";
import CityDAO from "../database/dao/city.dao";
import BatchDAO from "../database/dao/batch.dao";
import { Batch } from "../database/models/Batch";
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

    public setBatchNum(newNum: number) {
        setBatchNum(newNum);
        return true;
    }
}

export default CacheService;
