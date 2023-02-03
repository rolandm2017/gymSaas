"use strict";
// wherein we observe the height and width of the map.
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectViewportSize = void 0;
const conversions_1 = require("./conversions");
function detectViewportSize(places) {
    let northMax = places[0].lat;
    let eastMax = places[0].long;
    let southMax = places[0].lat;
    let westMax = places[0].long;
    for (const place of places) {
        if (place.lat > northMax) {
            northMax = place.lat;
        }
        if (place.lat < southMax) {
            southMax = place.lat;
        }
        if (place.long < westMax) {
            westMax = place.long;
        }
        if (place.long > eastMax) {
            eastMax = place.long;
        }
    }
    const latitudeChange = Math.abs(northMax - southMax);
    const longitudeChange = Math.abs(eastMax - westMax);
    const kmChangeNorthSouth = (0, conversions_1.getDistanceInKMFromLatLong)(westMax, northMax, westMax, southMax);
    const kmChangeEastWest = (0, conversions_1.getDistanceInKMFromLatLong)(westMax, southMax, eastMax, southMax);
    return {
        north: northMax,
        east: eastMax,
        south: southMax,
        west: westMax,
        latitudeChange,
        longitudeChange,
        kmNorthSouth: kmChangeNorthSouth,
        kmEastWest: kmChangeEastWest,
    };
}
exports.detectViewportSize = detectViewportSize;
