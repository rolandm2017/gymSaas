"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertGymModelToIGym = void 0;
function convertGymModelToIGym(gym, cityName) {
    const asInterface = {
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
        place_id: "",
        icon: "",
        rating: 5, // fixed until scope creep causes it to be relevant
    };
    return asInterface;
}
exports.convertGymModelToIGym = convertGymModelToIGym;
