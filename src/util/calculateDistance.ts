import { IGym } from "../interface/Gym.interface";
import { IHousing } from "../interface/Housing.interface";
import { ILatLong } from "../interface/LatLong.interface";

export function sortWestToEast(places: IHousing[] | IGym[]): IHousing[] | IGym[] {
    // todo: implement
    function compare(a: IHousing | IGym, b: IHousing | IGym) {
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

function binarySearch(nums: Array<IHousing>, key: IGym, qualifyingDistance: number): number {
    let low = 0;
    let high = nums.length - 1;
    while (low <= high) {
        let index = Math.floor((low + high) / 2);
        index;
        if (isCloseEnough(nums[index], key, qualifyingDistance)) {
            return index;
        }
        const currentApartmentIsWestOfGym = nums[index].lat < key.lat;
        if (currentApartmentIsWestOfGym) {
            low = index + 1; // move low a bit further east
        } else {
            high = index - 1; // move high a bit further west
        }
    }
    return -1;
}

function isCloseEnough(apartment: IHousing, gym: IGym, qualifyingDistance: number): boolean {
    if (apartment.lat === undefined || apartment.long === undefined || gym.lat === undefined || gym.long === undefined) {
        throw new Error("Place location data missing");
    }
    const distance = pythagoras(difference(apartment.lat, gym.lat), difference(apartment.lat, gym.lat));
    return distance < qualifyingDistance;
}

// export function binarySearch(aps: IHousing[], gym: IGym): IGym {
//     const qualifiedUnits:IHousing[] = [];
//     for (let i = 0;i<aps.length;i++){

//     }
//     return {};
// }

export function pythagoras(a: number, b: number): number {
    const aSquared = a ** 2;
    const bSquared = b ** 2;
    const cSquared = aSquared + bSquared;
    const c = Math.sqrt(cSquared);
    return c;
}

export function difference(a: number, b: number): number {
    return Math.abs(a - b);
}

function getDistance(apartment: IHousing | ILatLong, gym: IGym | ILatLong): number {
    if (apartment.lat === undefined || apartment.long === undefined || gym.lat === undefined || gym.long === undefined) {
        throw new Error("Place location data missing");
    }
    return pythagoras(difference(apartment.lat, gym.lat), difference(apartment.long, gym.long));
}

export default getDistance;
