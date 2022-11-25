import { Gym, GymCreationAttributes } from "../models/Gym";

class GymDAO {
    constructor() {}

    createGym = async (gym: GymCreationAttributes) => {
        return await Gym.create(gym);
    };

    getMultipleGyms = async (city: string, limit?: number, offset?: number) => {
        return await Gym.findAndCountAll({ where: { city }, limit, offset });
    };
}

export default GymDAO;
