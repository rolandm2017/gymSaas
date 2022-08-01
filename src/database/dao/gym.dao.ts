import { Gym, GymCreationAttributes } from "../models/Gym";

export const getMultipleGyms = (limit: number, offset?: number) => {
    return Gym.findAndCountAll({ offset, limit });
};

export const getGymById = (id: number) => {
    return Gym.findByPk(id);
};

export const createGym = (gym: GymCreationAttributes) => {
    console.log(gym, "12rm");
    return Gym.create(gym);
};

export const updateGym = (gym: GymCreationAttributes, id: number) => {
    return Gym.update(gym, { where: { id } });
};

export const deleteGym = (id: number) => {
    return Gym.destroy({ where: { id } });
};
