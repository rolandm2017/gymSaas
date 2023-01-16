import { IAssociation } from "../interface/Association.interface";
import { IGym } from "../interface/Gym.interface";
import { IHousing } from "../interface/Housing.interface";
import { ILatLong } from "../interface/LatLong.interface";
import { convertLatLongDifferenceIntoKM, getDistanceInKMFromLatLong } from "./conversions";

// NOTE: Everything in this file presumes a flat surface.
// Therefore feeding a qualifying distance of "50 km" will get slightly off #s due to the curvature of the Earth.
// (Probably irrelevant)

export function qualify(apartments: IHousing[], gyms: IGym[], qualifyingDistance: number): IHousing[] {
    if (qualifyingDistance < 0) {
        throw new Error("Can't qualify with negative distance");
    }
    const sortedAps: IHousing[] = sortWestToEast(apartments) as IHousing[];
    const sortedGyms: IGym[] = sortWestToEast(gyms) as IGym[];
    const apsWithNearbyGyms = [];
    for (const ap of sortedAps) {
        const hitRegion: number = binarySearch(ap, sortedGyms, qualifyingDistance);
        const nearbyGyms: IGym[] = [...lookAroundForNearbyGyms(ap, sortedGyms, hitRegion, qualifyingDistance)];
        const associations: IAssociation[] = createAssociations(ap, nearbyGyms);
        if (associations.length > 0) {
            // only return gyms with at least 1 nearby apartment
            ap.nearbyGyms = associations;
            apsWithNearbyGyms.push(ap);
        }
    }
    return apsWithNearbyGyms;
}

export function sortWestToEast(places: IHousing[] | IGym[]): IHousing[] | IGym[] {
    function compare(a: IHousing | IGym, b: IHousing | IGym): number {
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

// go west to east, calculating the east-west distance between the apartment and the gym.
// if east-west is too big, move to the next one. If its east-west dist is too big also, skip.
// if its east-west distance is small enough, check the north-south distance. If it's plausible, analyze it.
// once the apartments are too far east for the current gym, move to the next gym.
// ah: binary search? "i found a reasonably close gym; let's switch to linear search now"

export function binarySearch(target: IHousing, gyms: IGym[], qualifyingDistance: number): number {
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
        } else {
            high = index - 1; // move high a bit further west
        }
    }
    return -1;
}

export function isCloseEnough(apartment: IHousing, gym: IGym, qualifyingDistance: number): boolean {
    if (apartment.lat === undefined || apartment.long === undefined || gym.lat === undefined || gym.long === undefined) {
        throw new Error("Place location data missing");
    }
    // const distance = pythagoras(difference(apartment.lat, gym.lat), difference(apartment.lat, gym.lat));
    const distance = convertLatLongDifferenceIntoKM(apartment.lat, apartment.long, gym.lat, gym.long);
    return distance < qualifyingDistance;
}

export function lookAroundForNearbyGyms(apartment: IHousing, gyms: IGym[], start: number, qDist: number): IGym[] {
    const nearbyGyms: IGym[] = [];
    for (let i = start; i >= 0; i--) {
        if (isCloseEnough(apartment, gyms[i], qDist)) {
            nearbyGyms.push(gyms[i]);
        } else {
            break;
        }
    }
    for (let i = start + 1; i < gyms.length; i++) {
        if (isCloseEnough(apartment, gyms[i], qDist)) {
            nearbyGyms.push(gyms[i]);
        } else {
            break;
        }
    }
    return nearbyGyms;
}

export function lookAroundForQualifiedApartments(apartments: IHousing[], gym: IGym, start: number, qDist: number): IHousing[] {
    const qualifiedUnits: IHousing[] = [];
    for (let i = start; i >= 0; i--) {
        if (isCloseEnough(apartments[i], gym, qDist)) {
            qualifiedUnits.push(apartments[i]);
        } else {
            break;
        }
    }
    for (let i = start + 1; i < apartments.length; i++) {
        if (isCloseEnough(apartments[i], gym, qDist)) {
            qualifiedUnits.push(apartments[i]);
        } else {
            break;
        }
    }
    return qualifiedUnits;
}

export function createAssociations(apartment: IHousing, gyms: IGym[]): IAssociation[] {
    const associations: IAssociation[] = [];
    for (const gym of gyms) {
        const d: number = convertLatLongDifferenceIntoKM(apartment.lat, apartment.long, gym.lat, gym.long);
        const i: IAssociation = {
            gym: gym,
            distanceInKM: d,
        };
        associations.push(i);
    }
    return associations;
}
