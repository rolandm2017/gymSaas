import { Batch } from "../models/Batch";

class BatchDAO {
    constructor() {}

    public addBatchNum = async (newBatchNum?: number): Promise<Batch> => {
        try {
            if (newBatchNum !== undefined) {
                return await Batch.create({ batchId: newBatchNum });
            }
            const highestCurrent = await this.getHighestBatchNum();
            if (highestCurrent) return await Batch.create({ batchId: highestCurrent + 1 });
            else return await Batch.create({ batchId: 1 });
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public getHighestBatchNum = async (): Promise<number | null> => {
        try {
            const batches = await Batch.findAll({ where: {}, order: [["batchId", "DESC"]], limit: 1 });
            if (batches.length === 0) return null;
            return batches[0].batchId;
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public getAllBatchNums = async (): Promise<number[]> => {
        try {
            const batches = await Batch.findAll({});
            const justNums: number[] = batches.map(b => b.batchId);
            return justNums;
        } catch (err) {
            console.log(err);
            throw err;
        }
    };
}

export default BatchDAO;
