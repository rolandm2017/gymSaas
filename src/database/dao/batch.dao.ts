import { TryCatchClassDecorator } from "../../util/tryCatchClassDecorator";
import { Batch } from "../models/Batch";

@TryCatchClassDecorator(Error, (err, context) => {
    console.log(context, err);
    throw err;
})
class BatchDAO {
    constructor() {}

    public async addBatchNum(newBatchNum?: number): Promise<Batch> {
        if (newBatchNum !== undefined) {
            return await Batch.create({ batchId: newBatchNum });
        }
        const highestCurrent = await this.getHighestBatchNum();
        if (highestCurrent) return await Batch.create({ batchId: highestCurrent + 1 });
        else return await Batch.create({ batchId: 1 });
    }

    public async getHighestBatchNum(): Promise<number | null> {
        const batches = await Batch.findAll({ where: {}, order: [["batchId", "DESC"]], limit: 1 });
        if (batches.length === 0) return null;
        return batches[0].batchId;
    }

    public async getAllBatchNums(): Promise<number[]> {
        const batches = await Batch.findAll({});
        const justNums: number[] = batches.map(b => b.batchId);
        return justNums;
    }

    public async deleteAll(): Promise<number> {
        const deleted = await Batch.destroy({ where: {} });
        return deleted;
    }
}

export default BatchDAO;
