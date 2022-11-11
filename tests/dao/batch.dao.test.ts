import BatchDAO from "../../src/database/dao/batch.dao";
import { app } from "../mocks/mockServer";

const batchDAO: BatchDAO = new BatchDAO();

beforeAll(async () => {
    await app.connectDB();
    // await app.dropAllTables(); // takes too long
    await app.dropTable("batch");
});

beforeEach(async () => {
    await app.dropTable("batch");
});

afterAll(async () => {
    await app.closeDB();
});

describe("batch DAO works as expected", () => {
    test("batch dao returns null if there is no batches", async () => {
        const definitelyNull = await batchDAO.getHighestBatchNum();
        expect(definitelyNull).toBe(null);
    });
    test("we can add a batch # by explicitly supplying the new batch #", async () => {
        const a = 15;
        await batchDAO.addBatchNum(a);
        const highest = await batchDAO.getHighestBatchNum();
        expect(highest).toBe(a);
    });
    test("we can get the highest batch # if it exists", async () => {
        await batchDAO.addBatchNum(1);
        await batchDAO.addBatchNum(2);
        await batchDAO.addBatchNum(3);
        await batchDAO.addBatchNum(4);
        const highest = await batchDAO.getHighestBatchNum();
        expect(highest).toBe(4);
    });
    test("we can increment the batch # by 1 without supplying an argument", async () => {
        await batchDAO.addBatchNum();
        await batchDAO.addBatchNum();
        await batchDAO.addBatchNum();
        await batchDAO.addBatchNum(); // will automatically become 4
        const highest = await batchDAO.getHighestBatchNum();
        expect(highest).toBe(4);
    });
});
