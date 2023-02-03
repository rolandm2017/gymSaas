"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gymDbEntryToIGym = void 0;
function gymDbEntryToIGym(gym) {
    const g = {
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
exports.gymDbEntryToIGym = gymDbEntryToIGym;
