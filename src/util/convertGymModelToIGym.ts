import { Gym } from "../database/models/Gym";
import { IGym } from "../interface/Gym.interface";

export function convertGymModelToIGym(gym: Gym, cityName: string): IGym {
    const asInterface: IGym = {
        cityId: gym.cityId,
        name: gym.name,
        cityName,
        lat: gym.lat,
        long: gym.long,
        business_status: "OPERATIONAL",
        formatted_address: gym.address,
        geometry: {
            location: {
                lat: gym.lat,
                lng: gym.long,
            },
        },
        place_id: "", // no clue how it got here or what it was for at the time, probably something from google.
        icon: "", // fixed until scope creep causes it to be relevant
        rating: 5, // fixed until scope creep causes it to be relevant
    };
    return asInterface;
}
