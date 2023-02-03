"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssociations = exports.lookAroundForQualifiedApartments = exports.lookAroundForNearbyGyms = exports.isCloseEnough = exports.binarySearch = exports.sortWestToEast = exports.qualify = void 0;
const conversions_1 = require("./conversions");
// NOTE: Everything in this file presumes a flat surface.
// Therefore feeding a qualifying distance of "50 km" will get slightly off #s due to the curvature of the Earth.
// (Probably irrelevant)
function qualify(apartments, gyms, qualifyingDistance) {
    if (qualifyingDistance < 0) {
        throw new Error("Can't qualify with negative distance");
    }
    const sortedAps = sortWestToEast(apartments);
    const sortedGyms = sortWestToEast(gyms);
    const apsWithNearbyGyms = [];
    for (const ap of sortedAps) {
        const hitRegion = binarySearch(ap, sortedGyms, qualifyingDistance);
        const nearbyGyms = [...lookAroundForNearbyGyms(ap, sortedGyms, hitRegion, qualifyingDistance)];
        const associations = createAssociations(ap, nearbyGyms);
        if (associations.length > 0) {
            // only return gyms with at least 1 nearby apartment
            ap.nearbyGyms = associations;
            apsWithNearbyGyms.push(ap);
        }
    }
    return apsWithNearbyGyms;
}
exports.qualify = qualify;
function sortWestToEast(places) {
    function compare(a, b) {
        if (a.lat === undefined) {
            return -1; // put the undefined ones at the end
        }
        if (b.lat === undefined) {
            return -1;
        }
        if (a.lat < b.lat) {
            return -1;
        }
        if (a.lat > b.lat) {
            return 1;
        }
        return 0;
    }
    return places.sort(compare);
}
exports.sortWestToEast = sortWestToEast;
// go west to east, calculating the east-west distance between the apartment and the gym.
// if east-west is too big, move to the next one. If its east-west dist is too big also, skip.
// if its east-west distance is small enough, check the north-south distance. If it's plausible, analyze it.
// once the apartments are too far east for the current gym, move to the next gym.
// ah: binary search? "i found a reasonably close gym; let's switch to linear search now"
function binarySearch(target, gyms, qualifyingDistance) {
    let low = 0;
    let high = gyms.length - 1;
    while (low <= high) {
        let index = Math.floor((low + high) / 2);
        index;
        if (isCloseEnough(target, gyms[index], qualifyingDistance)) {
            return index;
        }
        const currentGymIsWestOfApartment = gyms[index].lat < target.lat;
        if (currentGymIsWestOfApartment) {
            low = index + 1; // move low a bit further east
        }
        else {
            high = index - 1; // move high a bit further west
        }
    }
    return -1;
}
exports.binarySearch = binarySearch;
function isCloseEnough(apartment, gym, qualifyingDistance) {
    if (apartment.lat === undefined || apartment.long === undefined || gym.lat === undefined || gym.long === undefined) {
        throw new Error("Place location data missing");
    }
    // const distance = pythagoras(difference(apartment.lat, gym.lat), difference(apartment.lat, gym.lat));
    const distance = (0, conversions_1.convertLatLongDifferenceIntoKM)(apartment.lat, apartment.long, gym.lat, gym.long);
    return distance < qualifyingDistance;
}
exports.isCloseEnough = isCloseEnough;
function lookAroundForNearbyGyms(apartment, gyms, start, qDist) {
    const nearbyGyms = [];
    for (let i = start; i >= 0; i--) {
        if (isCloseEnough(apartment, gyms[i], qDist)) {
            nearbyGyms.push(gyms[i]);
        }
        else {
            break;
        }
    }
    for (let i = start + 1; i < gyms.length; i++) {
        if (isCloseEnough(apartment, gyms[i], qDist)) {
            nearbyGyms.push(gyms[i]);
        }
        else {
            break;
        }
    }
    return nearbyGyms;
}
exports.lookAroundForNearbyGyms = lookAroundForNearbyGyms;
function lookAroundForQualifiedApartments(apartments, gym, start, qDist) {
    const qualifiedUnits = [];
    for (let i = start; i >= 0; i--) {
        if (isCloseEnough(apartments[i], gym, qDist)) {
            qualifiedUnits.push(apartments[i]);
        }
        else {
            break;
        }
    }
    for (let i = start + 1; i < apartments.length; i++) {
        if (isCloseEnough(apartments[i], gym, qDist)) {
            qualifiedUnits.push(apartments[i]);
        }
        else {
            break;
        }
    }
    return qualifiedUnits;
}
exports.lookAroundForQualifiedApartments = lookAroundForQualifiedApartments;
function createAssociations(apartment, gyms) {
    const associations = [];
    for (const gym of gyms) {
        const d = (0, conversions_1.convertLatLongDifferenceIntoKM)(apartment.lat, apartment.long, gym.lat, gym.long);
        const i = {
            gym: gym,
            distanceInKM: d,
        };
        associations.push(i);
    }
    return associations;
}
exports.createAssociations = createAssociations;
