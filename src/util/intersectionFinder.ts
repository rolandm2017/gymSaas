import { ILatLong } from "../interface/LatLong.interface";
import { getDistanceInKMFromLatLong } from "./conversions";

// for finding the intersection of an array of apartments with an array of gyms
// https://leetcode.com/problems/intersection-of-two-arrays-ii/discuss/1276222/Easy-javascript-soluction-faster-than-99.70

function intersectionFinder(apartmentCoords: ILatLong[], gymCoords: ILatLong[], maxDistanceInKm: number) {
    // max deg change latitude and max deg change longitude might be very different numbers!
    apartmentCoords.sort((a, b) => a.lat - b.lat); // sorted north-south
    gymCoords.sort((a, b) => a.lat - b.lat);

    let i = 0;
    let j = 0;
    let qualifiedApartmentIndexes = [];
    while (i < apartmentCoords.length && j < gymCoords.length) {
        // if (apartmentCoords[i] === gymCoords[j]) {
        const distanceInKm = getDistanceInKMFromLatLong(apartmentCoords[i].lat, apartmentCoords[i].long, gymCoords[i].lat, gymCoords[i].long);
        if (distanceInKm < maxDistanceInKm) {
            qualifiedApartmentIndexes.push(i);
            i++;
            j++;
        } else if (apartmentCoords[i] < gymCoords[j]) {
            i++;
        } else {
            j++;
        }
    }

    return qualifiedApartmentIndexes; // after this, extract the apartments with these indexes. save them. delete the rest.
}

export default intersectionFinder;

// step 1: organize north to south
// step 2: ask if the current apartment is "even close to being near" the current gym.
// meaning if the apartments lat is now so far south that the gyms are all excluded, its time to move on!
//                once the apartments are no longer "even close" to being near the current gym, move the current gym up.

// if the max distance is .02 degrees, and the gyms are now all at least .02 degrees away,
// move the gyms up and find the apartments

function getPossiblyQualifiedApartments(apartmentCoordsSortedByLat: ILatLong[], gym: ILatLong, maxChangeInLatitude: number) {
    const possiblyQualified: ILatLong[] = [];
    for (let i = 0; i < apartmentCoordsSortedByLat.length; i++) {
        if (apartmentCoordsSortedByLat[i].lat > gym.lat + maxChangeInLatitude) break;
        if (apartmentCoordsSortedByLat[i].lat < gym.lat - maxChangeInLatitude) continue;
        possiblyQualified.push(apartmentCoordsSortedByLat[i]);
    }
    return possiblyQualified; // note its still sorted north-south
}

function getQualifiedApartments(apartmentsNotDisqualifiedByLatitudePosition: ILatLong[], gym: ILatLong, maxChangeInLongitude: number) {
    const qualified: ILatLong[] = [];
    for (let i = 0; i < apartmentsNotDisqualifiedByLatitudePosition.length; i++) {}
}

// I could: (a) write all the apartments (b) get a gym (c) update all apartments within the "blast zone" of the gym as "has a nearby gym"
// (b.2) get the next gym (c.2)
// (d) when out of gyms, delete all apartments that aren't marked as "has a nearby gym"
