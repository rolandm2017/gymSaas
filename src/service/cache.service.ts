import { getCityIdFromCacheElseDb, setCityId } from "../database/cache/cityIdCache";
import {
    getBatchNumForNewBatches,
    setBatchNumForNewBatches,
    addBatchNumIfNotExists,
    initBatchCacheFromDb,
    getAllBatchNums,
    resetBatchCache,
} from "../database/cache/batchNumCache";
import CityDAO from "../database/dao/city.dao";
import BatchDAO from "../database/dao/batch.dao";
import { setQuestionOne, setQuestionTwo } from "../database/cache/questionsCache";
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
        // returns highest available number.
        return await getBatchNumForNewBatches(this.batchDAO);
    }

    public async getAllBatchNums() {
        return getAllBatchNums();
    }

    public setBatchNumForNewBatches(newNum: number): Promise<number[]> {
        return setBatchNumForNewBatches(newNum, this.batchDAO);
    }

    public addBatchNumIfNotExists(newNum: number): Promise<number[]> {
        return addBatchNumIfNotExists(newNum, this.batchDAO);
    }

    public clearBatchCache() {
        resetBatchCache();
    }

    public async initQuestionscache() {
        const questions = await this.feedbackDAO.readLatest();
        setQuestionOne(questions.questionOne);
        setQuestionTwo(questions.questionTwo);
    }

    // init functions for when the server restarts
    public async initBatchCache() {
        const batchNums = await this.batchDAO.getAllBatchNums();
        initBatchCacheFromDb(batchNums);
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
