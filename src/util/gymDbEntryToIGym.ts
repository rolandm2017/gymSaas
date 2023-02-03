import { Gym } from "../database/models/Gym";
import { IGym } from "../interface/Gym.interface";

export function gymDbEntryToIGym(gym: Gym): IGym {
    const g: IGym = {
        business_status: "OPERATIONAL",
        formatted_address: gym.address,
        geometry: {
            location: {
                lat: gym.lat,
                lng: gym.long,
            },
        },
        url: gym.url,
        icon: gym.icon ? gym.icon : "",
        name: gym.name,
        place_id: "",
        rating: gym.rating ? gym.rating : 5,
        lat: gym.lat,
        long: gym.long,
        cityId: gym.cityId,
        cityName: gym.cityName,
    };
    return g;
}
