import { app } from "./mocks/server";

// afterEach(async () => {
// await server.closeDB();
// });
afterAll(async () => {
    await app.closeDB();
});
