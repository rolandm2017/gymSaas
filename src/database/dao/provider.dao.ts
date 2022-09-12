import { Provider, ProviderCreationAttributes } from "../models/Provider";

export const getMultipleProviders = (limit: number, offset?: number) => {
    return Provider.findAndCountAll({ offset, limit });
};

export const getProviderById = (id: number) => {
    return Provider.findByPk(id);
};

// todo: create "get provider by name" i.e. rentCanada, rentSeeker, rentFaster

export const createProvider = (provider: ProviderCreationAttributes) => {
    return Provider.create(provider);
};

export const updateProvider = (provider: ProviderCreationAttributes, id: number) => {
    return Provider.update(provider, { where: { id } });
};

export const deleteProvider = (id: number) => {
    return Provider.destroy({ where: { id } });
};
