import { Gym, GymCreationAttributes } from "../models/Gym";

class GymDAO {
    constructor() {}

    createGym = async (gym: GymCreationAttributes) => {
        return await Gym.create(gym);
    };

    getEntriesWithNullCityId = async () => {
        return await Gym.findAll({ where: { cityId: null } });
    };

    getMultipleGyms = async (cityName: string, limit?: number, offset?: number) => {
        return await Gym.findAndCountAll({ where: { cityName }, limit, offset });
    };

    getAllGyms = async () => {
        return await Gym.findAll({});
    };

    // update
    addCityIdToGyms = async (entriesToCorrect: Gym[], missingCityId: number) => {
        const gymIdsToCorrect = entriesToCorrect.map(gym => gym.gymId);
        const updatedGyms = await Gym.update({ cityId: missingCityId }, { where: { gymId: gymIdsToCorrect } });
        return updatedGyms;
    };

    deleteAllGyms = async () => {
        return await Gym.destroy({ where: {} });
    };
}

export default GymDAO;
