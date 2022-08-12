import { Gym } from "../database/models/Gym";
import { IGym } from "../interface/Gym.interface";

export function gymDbEntryToIGym(gym: Gym): IGym {
    const g = {
        business_status: "OPERATIONAL",
        formatted_address: "",
        geometry: {
            location: {
                lat: gym.lat,
                lng: gym.long,
            },
        },
        icon: "",
        name: "",
        opening_hours: { open_now: true },
        place_id: "",
        rating: 5,
        lat: gym.lat,
        long: gym.long,
    };
    return g;
}
