// from the origin, create a grid extending N km in any given direction.
// it could be a grid, it could be a sphere. But it will have sharp edges.

import { changeInEastWestKMToLongitudeDegrees, changeInNorthSouthKMToLatitudeDegrees } from "./conversions";

function generateGrid(startLong: number, startLat: number, jump: number, radius: number) {
    /*
     * jump - the space between the focal point ("center") of any two grid positions
     * radius - how far from the origin we want to go.
     */
    const start = { x: startLong, y: startLat };
    const ringDistances = [];
    let d = 0;
    for (let i = 0; d < radius; i++) {
        d = jump * i;
        ringDistances.push(d);
    }
    const nodes = ringDistances.map(d => getNextRing(start, jump, d));
    return nodes.flat();
}

function getNextRing(focalPoint: { x: number; y: number }, jump: number, ringDistance: number) {
    // from the focal point, calculate distance to sides.
    // then divide the sides into Y subsections.
    /*
     * focalPoint - where the grid is centered.
     * ringDistance - distance from focalPoint to the nearest point on the perimeter of the ring (which is a square)
     */

    const minX = focalPoint.x - ringDistance;
    const maxX = focalPoint.x + ringDistance;
    const minY = focalPoint.y - ringDistance;
    const maxY = focalPoint.y + ringDistance;

    // const topLeftCorner = { x: minX, y: maxY };
    // const topRightCorner = { x: maxX, y: maxY };
    // const bottomLeftCorner = { x: minX, y: minY };
    // const bottomRightCorner = { x: maxX, y: minY };

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
        topEdge.push({ x: minX + progressAlongEdge, y: maxY });
        rightEdge.push({ x: maxX, y: maxY - progressAlongEdge });
        bottomEdge.push({ x: maxX - progressAlongEdge, y: minY });
        leftEdge.push({ x: minX, y: minY + progressAlongEdge });
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
