import { Housing, HousingCreationAttributes } from "../models/Housing";

export const getMultipleHousings = (limit: number, offset?: number) => {
    return Housing.findAndCountAll({ offset, limit });
};

export const getHousingById = (id: number) => {
    return Housing.findByPk(id);
};

export const createHousing = (housing: HousingCreationAttributes) => {
    return Housing.create(housing);
};

export const updateHousing = (housing: HousingCreationAttributes, id: number) => {
    return Housing.update(housing, { where: { id } });
};

export const deleteHousing = (id: number) => {
    return Housing.destroy({ where: { id } });
};
