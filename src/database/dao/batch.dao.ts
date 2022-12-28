import { TryCatchClassDecorator } from "../../util/tryCatchClassDecorator";
import { Batch } from "../models/Batch";

@TryCatchClassDecorator(Error, (err, context) => {
    console.log(context, err);
    throw err;
})
class BatchDAO {
    constructor() {}

    public addBatchNum = async (newBatchNum?: number): Promise<Batch> => {
        if (newBatchNum !== undefined) {
            return await Batch.create({ batchId: newBatchNum });
        }
        const highestCurrent = await this.getHighestBatchNum();
        if (highestCurrent) return await Batch.create({ batchId: highestCurrent + 1 });
        else return await Batch.create({ batchId: 1 });
    };

    public getHighestBatchNum = async (): Promise<number | null> => {
        const batches = await Batch.findAll({ where: {}, order: [["batchId", "DESC"]], limit: 1 });
        if (batches.length === 0) return null;
        return batches[0].batchId;
    };

    public getAllBatchNums = async (): Promise<number[]> => {
        const batches = await Batch.findAll({});
        const justNums: number[] = batches.map(b => b.batchId);
        return justNums;
    };
}

export default BatchDAO;
