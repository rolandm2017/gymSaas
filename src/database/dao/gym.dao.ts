import { Gym, GymCreationAttributes } from "../models/Gym";

class GymDAO {
    constructor() {}

    createGym = async (gym: GymCreationAttributes) => {
        return await Gym.create(gym);
    };

    getMultipleGyms = async (cityName: string, limit?: number, offset?: number) => {
        return await Gym.findAndCountAll({ where: { cityName }, limit, offset });
    };

    deleteAllGyms = async () => {
        return await Gym.destroy({ where: {} });
    };
}

export default GymDAO;
