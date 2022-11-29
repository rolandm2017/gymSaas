import { IBatch } from "../../interface/Batch.interface";
import { Batch } from "../models/Batch";
// tentative

class BatchDAO {
    constructor() {}

    public addBatchNum = async (newBatchNum?: number) => {
        if (newBatchNum !== undefined) {
            return await Batch.create({ batchId: newBatchNum });
        }
        const highestCurrent = await this.getHighestBatchNum();
        if (highestCurrent) return await Batch.create({ batchId: highestCurrent + 1 });
        else return await Batch.create({ batchId: 1 });
    };

    public getHighestBatchNum = async () => {
        try {
            const b = await Batch.findAll({ where: {}, order: [["batchId", "DESC"]], limit: 1 });
            if (b.length === 0) return null;
            return b[0].batchId;
        } catch (err) {
            console.log(err);
        }
    };

    public getAllBatchNums = async () => {
        try {
            const batches = await Batch.findAll({});
            const justNums: IBatch[] = batches.map(b => {
                return {
                    batchId: b.batchId,
                };
            });
            return justNums;
        } catch (err) {
            console.log(err);
            return []; // silence errors about returning undefined
        }
    };
}

export default BatchDAO;
