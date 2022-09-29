// from the origin, create a grid extending N km in any given direction.
// it could be a grid, it could be a sphere. But it will have sharp edges.

import { changeInEastWestKMToLongitudeDegrees, changeInNorthSouthKMToLatitudeDegrees } from "./conversions";

import { ILatLong } from "../interface/LatLong.interface";

export function generateGrid(startCoords: ILatLong, jump: number, radius: number): ILatLong[] {
    /*
     * jump - the space between the focal point ("center") of any two grid positions
     * radius - how far from the origin we want to go.
     */
    const ringDistances: number[] = [];
    let d = 0;
    for (let i = 0; d < radius; i++) {
        d = jump * i;
        ringDistances.push(d);
    }
    const nodes: ILatLong[][] = ringDistances.map(d => getNextRing(startCoords, jump, d));
    return nodes.flat();
}

function getNextRing(focalPoint: ILatLong, jump: number, ringDistance: number): ILatLong[] {
    // from the focal point, calculate distance to sides.
    // then divide the sides into Y subsections.
    /*
     * focalPoint - where the grid is centered.
     * ringDistance - distance from focalPoint to the nearest point on the perimeter of the ring (which is a square)
     */

    const minX = focalPoint.long - ringDistance;
    const maxX = focalPoint.long + ringDistance;
    const minY = focalPoint.lat - ringDistance;
    const maxY = focalPoint.lat + ringDistance;

    // because the distance from the center to the nearest point on the perimeter * 2 = a full side
    const sideLength = ringDistance * 2;
    const subdivisions: number = sideLength / jump; // note: expecting integer values

    // todo: fill me in
    const topEdge = [];
    const rightEdge = [];
    const bottomEdge = [];
    const leftEdge = [];
    for (let i = 0; i < subdivisions; i++) {
        const progressAlongEdge = i * jump;
        // clockwise
        topEdge.push({ long: minX + progressAlongEdge, lat: maxY });
        rightEdge.push({ long: maxX, lat: maxY - progressAlongEdge });
        bottomEdge.push({ long: maxX - progressAlongEdge, lat: minY });
        leftEdge.push({ long: minX, lat: minY + progressAlongEdge });
    }

    return [topEdge, rightEdge, bottomEdge, leftEdge].flat();
}

function generateSimpleGrid(startLong: number, startLat: number, radius: number, jump: number) {
    // get left hand side from coords + radius left;
    // get right hand side from ... you get the picture
    // at some point convert from long/lat to km and back
    /*
     * startingLong & Lat - center of the grid
     * radius - in km
     * jump - distance between centers of the grid (in degrees)
     */
    const radiusAsDegreesLong = changeInEastWestKMToLongitudeDegrees(radius, startLat, startLong);
    const radiusAsDegreesLat = changeInNorthSouthKMToLatitudeDegrees(radius, startLat);
    const furthestPointNorth = startLat + radiusAsDegreesLat;
    const furthestPointSouth = startLat - radiusAsDegreesLat;
    const furthestPointEast = startLong + radiusAsDegreesLong;
    const furthestPointWest = startLong - radiusAsDegreesLong;

    const subdivisionCoords = [];
    for (let y = furthestPointNorth; y < furthestPointSouth; y -= jump) {
        for (let x = furthestPointWest; x < furthestPointEast; x += jump) {
            const point = { x, y };
            subdivisionCoords.push(point);
        }
    }
    return subdivisionCoords;
}
