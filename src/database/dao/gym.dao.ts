import { TryCatchClassDecorator } from "../../util/tryCatchClassDecorator";
import { Gym, GymCreationAttributes } from "../models/Gym";

@TryCatchClassDecorator(Error, (err, context) => {
    console.log(context, err);
    throw err;
})
class GymDAO {
    constructor() {}

    public async createGym(gym: GymCreationAttributes) {
        return await Gym.create(gym);
    }

    public async getGymByGymId(gymId: number) {
        return await Gym.findByPk(gymId);
    }

    public async getGymByAddress(address: string) {
        return await Gym.findAll({ where: { address } });
    }

    public async getEntriesWithNullCityId() {
        return await Gym.findAll({ where: { cityId: null } });
    }

    public async getMultipleGyms(cityName: string, limit?: number, offset?: number): Promise<{ rows: Gym[]; count: number }> {
        return await Gym.findAndCountAll({ where: { cityName }, limit, offset });
    }

    public async getAllGyms() {
        return await Gym.findAll({});
    }

    // update
    public async addCityIdToGyms(entriesToCorrect: Gym[], missingCityId: number): Promise<number> {
        const gymIdsToCorrect = entriesToCorrect.map(gym => gym.gymId);
        const updatedGyms = await Gym.update({ cityId: missingCityId }, { where: { gymId: gymIdsToCorrect } });
        return updatedGyms[0];
    }

    public async deleteAllGyms() {
        return await Gym.destroy({ where: {} });
    }
}

export default GymDAO;
