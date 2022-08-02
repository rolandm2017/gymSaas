import { ILatLong } from "../interface/LatLong.interface";
import {
    KMDistanceBetweenOneDegreeLatitude,
    KMDistanceBetweenOneDegreeLongitudeAtMax,
    minDegreesLatitude,
    maxDegreesLatitude,
    milesBetweenOneDegreeOfLongitudeAtMax,
    oneMileAsKM,
    latitudeAtEquator,
} from "./constants";

// ==
// Latitude:
// is parallel to the equator.
// The distance covered by a degree of latitude is always nigh the same: 69 miles +/- .5 miles or 111 km.
// Latitude goes from 0 at the equator to 90 deg at the North pole, and to -90 at the South pole.
// ==
// Longitude:
// is measured east-west from the Prime Meridian.
// The distance between degrees is 69.172 miles (111.321 km) at the equator, 0 at the poles.
// So going from 179 deg long to 180 deg long at 0 deg lat is 69.172 miles.
// And going from 179 long to 180 long at 89 deg lat is almost 0 miles.

export function convertKMChangeToLatLong(kmNorth: number, kmEast: number, startingLat: number, startingLong: number): ILatLong {
    const changeInLatitude = northSouthChangeInKMToLatitudeDegrees(kmNorth, startingLat, startingLong);
    const changeInLongitude = eastWestChangeInKMToLongitudeDegrees(kmEast, startingLat, startingLong);
    const newLatitude = startingLat + changeInLatitude;
    const newLongitude = startingLong + changeInLongitude;
    const newCoordinates = { lat: newLatitude, long: newLongitude };
    return newCoordinates;
}

export function convertProgressTowardsNorthPoleAsPercentage(degreesFromEquator: number): number {
    if (degreesFromEquator < latitudeAtEquator || degreesFromEquator > maxDegreesLatitude) {
        throw new Error("Degrees from equator must be between 0 and 90, inclusive");
    }
    return degreesFromEquator / maxDegreesLatitude;
}

export function northSouthChangeInKMToLatitudeDegrees(kmNorth: number, currentLat: number, currentLong: number): number {
    // TODO: Test this method
    const changeInLatitude = kmNorth / KMDistanceBetweenOneDegreeLatitude;
    const newLatitude = currentLat + changeInLatitude;
    return newLatitude;
}

export function eastWestChangeInKMToLongitudeDegrees(kmEast: number, currentLat: number, currentLong: number): number {
    // TODO: Test this method
    if (currentLat < 0) {
        throw new Error("Southern hemisphere not yet served by application logic");
    }
    const degreesFromEquator = currentLat;
    const progressTowardsNorthPoleAsPercentage = convertProgressTowardsNorthPoleAsPercentage(degreesFromEquator);
    const changeInLongitude = kmEast / (progressTowardsNorthPoleAsPercentage * KMDistanceBetweenOneDegreeLongitudeAtMax);
    const newLongitude = currentLong + changeInLongitude;
    return newLongitude;
}

// Zombie code from Aug 1 - replaced by the stackOverflow solution
// export function convertLatitudeChangeToKM(latitudeChange: number): number {
//     return latitudeChange * KMDistanceBetweenOneDegreeLatitude;
// }

// export function convertLongitudeChangeToKM(longitudeChange: number, currentLat: number): number {
//     // https://gis.stackexchange.com/questions/251643/approx-distance-between-any-2-longitudes-at-a-given-latitude
//     // "To convert a given latitude into the approximate distance in miles between 1 longitude at that point:
//     // (90 - Decimal degrees) * Pi / 180 * 69.172"
//     const degreesFromEquator = currentLat;
//     const progressTowardsNorthPoleAsPercentage = convertProgressTowardsNorthPoleAsPercentage(degreesFromEquator, maxDegreesLatitude);
//     const changeInMiles = (((maxDegreesLatitude - longitudeChange) * 3.1415927) / 180) * milesBetweenOneDegreeOfLongitudeAtMax;
//     // Note: I have no idea what the "180" represents. It's from the stackExchange discussion linked above.
//     const changeInKilometers = changeInMiles * oneMileAsKM;
//     return changeInKilometers;
// }

// Source: https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
export function getDistanceFromLatLongInKm(lat1: number, long1: number, lat2: number, long2: number): number {
    // "Convert lat long change into km change".
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(long2 - long1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

export function distanceInKM(lat1: number, lon1: number, lat2: number, lon2: number) {
    var p = 0.017453292519943295; // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p) / 2 + (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}
