import { ProviderEnum } from "../enum/provider.enum";
import { IAssociation } from "./Association.interface";
import { IHousing } from "./Housing.interface";

export interface IHousingWithUrl extends IHousing {
    url: string;
}
