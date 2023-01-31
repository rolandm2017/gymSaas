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
    const changeInLatitude = changeInNorthSouthKMToLatitudeDegrees(kmNorth, startingLat);
    const changeInLongitude = changeInEastWestKMToLongitudeDegrees(kmEast, startingLat, startingLong);
    const newLatitude = startingLat + changeInLatitude;
    const newLongitude = startingLong + changeInLongitude;
    const newCoordinates = { lat: newLatitude, long: newLongitude };
    return newCoordinates;
}

export function convertProgressTowardsNorthPoleAsPercentage(degreesLatitudeFromEquator: number): number {
    if (degreesLatitudeFromEquator < latitudeAtEquator) {
        throw new Error("Southern hemisphere not yet served by application logic");
    }
    if (degreesLatitudeFromEquator > maxDegreesLatitude) {
        throw new Error("Latitude out bounds");
    }
    return degreesLatitudeFromEquator / maxDegreesLatitude;
}

export function changeInNorthSouthKMToLatitudeDegrees(kmNorth: number, currentLat: number): number {
    if (currentLat < latitudeAtEquator) {
        throw new Error("Southern hemisphere not yet served by application logic");
    }
    if (currentLat > maxDegreesLatitude) {
        throw new Error("Latitude out bounds");
    }
    const changeInLatitude = kmNorth / KMDistanceBetweenOneDegreeLatitude;
    // const newLatitude = currentLat + changeInLatitude;
    return changeInLatitude;
}

// Q for reviewers: would throwing an error if any arg is undefined or null be too much?

export function changeInEastWestKMToLongitudeDegrees(kmEast: number, currentLat: number, currentLong: number): number {
    const noChange = kmEast === 0;
    if (noChange) {
        return 0;
    }
    if (currentLat < latitudeAtEquator) {
        throw new Error("Southern hemisphere not yet served by application logic");
    }
    if (currentLat > maxDegreesLatitude) {
        throw new Error("Latitude out bounds");
    }
    if (currentLong > 180 || currentLong < -180) {
        throw new Error("Longitude out of bounds");
    }
    const tenDegrees = 10;
    const prettyCloseToNorthPole = maxDegreesLatitude - tenDegrees;
    if (currentLat > prettyCloseToNorthPole) {
        throw new Error("We don't bother doing math at the North Pole");
    }
    const degreesFromEquator = currentLat;
    const progressTowardsNorthPoleAsPercentage = convertProgressTowardsNorthPoleAsPercentage(degreesFromEquator);
    const changeInLongitude = kmEast / ((1 - progressTowardsNorthPoleAsPercentage) * KMDistanceBetweenOneDegreeLongitudeAtMax);
    // const newLongitude = currentLong + changeInLongitude;
    return changeInLongitude;
}

// Source: https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
export function getDistanceInKMFromLatLong(lat1: number, long1: number, lat2: number, long2: number): number {
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

// second answer, supposedly a faster computation:
// https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
export function convertLatLongDifferenceIntoKM(lat1: number, lon1: number, lat2: number, lon2: number) {
    var p = 0.017453292519943295; // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p) / 2 + (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}
