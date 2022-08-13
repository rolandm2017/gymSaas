import { IGym } from "./Gym.interface";
import { IHousing } from "./Housing.interface";

export interface IAssociation {
    // associates a gym with an apartment or an apartment with a gym.
    apartment?: IHousing;
    gym?: IGym;
    distanceInKM: number;
}
