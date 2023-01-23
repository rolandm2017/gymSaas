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
import { getQuestions, setQuestionOne, setQuestionThree, setQuestionTwo } from "../database/cache/questionsCache";
import FeedbackDAO from "../database/dao/feedback.dao";

class CacheService {
    private cityDAO: CityDAO;
    private batchDAO: BatchDAO;
    private feedbackDAO: FeedbackDAO;
    constructor(cityDAO: CityDAO, batchDAO: BatchDAO, feedbackDAO: FeedbackDAO) {
        this.cityDAO = cityDAO;
        this.batchDAO = batchDAO;
        this.feedbackDAO = feedbackDAO;
    }

    // city id stuff
    public async getCityId(city: string) {
        return await getCityIdFromCacheElseDb(city, this.cityDAO);
    }

    public setCityId(cityName: string, cityId: number) {
        setCityId(cityName, cityId);
    }

    // batch num stuff
    public async getBatchNumForNewBatches(): Promise<number> {
        // returns highest available number.
        return await getBatchNumForNewBatches(this.batchDAO);
    }

    public async getAllBatchNums(): Promise<number[]> {
        return await getAllBatchNums();
    }

    public async setBatchNumForNewBatches(newNum: number): Promise<number[]> {
        return await setBatchNumForNewBatches(newNum, this.batchDAO);
    }

    public async addBatchNumIfNotExists(newNum: number): Promise<number[]> {
        return await addBatchNumIfNotExists(newNum, this.batchDAO);
    }

    public clearBatchCache() {
        resetBatchCache();
    }

    // feedback stuff
    public async getCurrentQuestions(): Promise<string[]> {
        return await getQuestions();
    }

    // init functions for when the server restarts
    public async initQuestionsCache() {
        const questions = await this.feedbackDAO.readLatest();
        if (questions === null) {
            throw new Error("No questions found");
        }
        setQuestionOne(questions.questionOne);
        setQuestionTwo(questions.questionTwo);
        setQuestionThree(questions.questionThree);
    }

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
