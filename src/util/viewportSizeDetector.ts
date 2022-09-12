// wherein we observe the height and width of the map.

import { IBounds } from "../interface/Bounds.interface";
import { IHousing } from "../interface/Housing.interface";
import { getDistanceFromLatLongInKm } from "./conversions";

export function detectViewportSize(places: IHousing[]): IBounds {
    let northMax = places[0].lat;
    let eastMax = places[0].long;
    let southMax = places[0].lat;
    let westMax = places[0].long;
    console.log(places[0], "12rm");

    for (const place of places) {
        if (place.lat > northMax) {
            console.log(`${place.lat} > ${northMax}, updating`);
            northMax = place.lat;
        }
        if (place.lat < southMax) {
            console.log(`${place.lat} > ${southMax}, updating`);
            southMax = place.lat;
        }
        if (place.long < westMax) {
            console.log(`${place.lat} > ${westMax}, updating`);
            westMax = place.long;
        }
        if (place.long > eastMax) {
            console.log(`${place.lat} > ${eastMax}, updating`);
            eastMax = place.long;
        }
    }

    const kmChangeNorthSouth = getDistanceFromLatLongInKm(westMax, northMax, westMax, southMax);
    const kmChangeEastWest = getDistanceFromLatLongInKm(westMax, southMax, eastMax, southMax);

    console.log(northMax, eastMax, southMax, westMax, kmChangeEastWest, kmChangeNorthSouth);
    return { north: northMax, east: eastMax, south: southMax, west: westMax, kmNorthSouth: kmChangeNorthSouth, kmEastWest: kmChangeEastWest };
}
