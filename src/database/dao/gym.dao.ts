import { TryCatchClassDecorator } from "../../util/tryCatchClassDecorator";
import { Gym, GymCreationAttributes } from "../models/Gym";

@TryCatchClassDecorator(Error, (err, context) => {
    console.log(context, err);
    throw err;
})
class GymDAO {
    constructor() {}

    createGym = async (gym: GymCreationAttributes) => {
        return await Gym.create(gym);
    };

    getGymByAddress = async (address: string) => {
        return await Gym.findAll({ where: { address } });
    };

    getEntriesWithNullCityId = async () => {
        return await Gym.findAll({ where: { cityId: null } });
    };

    getMultipleGyms = async (cityName: string, limit?: number, offset?: number): Promise<{ rows: Gym[]; count: number }> => {
        return await Gym.findAndCountAll({ where: { cityName }, limit, offset });
    };

    getAllGyms = async () => {
        return await Gym.findAll({});
    };

    // update
    addCityIdToGyms = async (entriesToCorrect: Gym[], missingCityId: number): Promise<number> => {
        const gymIdsToCorrect = entriesToCorrect.map(gym => gym.gymId);
        const updatedGyms = await Gym.update({ cityId: missingCityId }, { where: { gymId: gymIdsToCorrect } });
        return updatedGyms[0];
    };

    deleteAllGyms = async () => {
        return await Gym.destroy({ where: {} });
    };
}

export default GymDAO;
