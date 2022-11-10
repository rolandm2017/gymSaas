import { Batch } from "../models/Batch";
// tentative

class BatchDAO {
    constructor() {}

    public getHighestBatchNum = async () => {
        try {
            const b = await Batch.findAll({ where: {}, order: [["batchId", "DESC"]], limit: 1 });
            if (b.length === 0) return null;
            return b[0].batchId;
        } catch (err) {
            console.log(err);
        }
    };

    public addBatchNum = async (newBatchNum?: number) => {
        try {
            if (newBatchNum) {
                return await Batch.create({ batchId: newBatchNum });
            }
            const highestCurrent = await this.getHighestBatchNum();
            if (highestCurrent) return await Batch.create({ batchId: highestCurrent + 1 });
            else return await Batch.create({ batchId: 1 });
        } catch (err) {
            console.log(err);
        }
    };
}

export default BatchDAO;
